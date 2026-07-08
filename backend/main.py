from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from pypdf import PdfReader
from io import BytesIO
import os
import re
import json


# ==========================
# ENVIRONMENT
# ==========================

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

MODEL_NAME = "openai/gpt-oss-20b:free"


# ==========================
# FASTAPI APP
# ==========================

app = FastAPI(
    title="AI Interview Assistant API",
    version="2.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================
# RESUME STORAGE
# ==========================

resume_text = ""


# ==========================
# REQUEST MODELS
# ==========================


class InterviewRequest(BaseModel):
    question: str
    role: str


class QuestionRequest(BaseModel):
    role: str
    difficulty: str = "Easy"
    category: str = "Technical"


class EvaluationRequest(BaseModel):
    question: str
    candidate_answer: str
    role: str


class ResumeAnalysisRequest(BaseModel):
    role: str


class StartInterviewRequest(BaseModel):
    role: str
    difficulty: str = "Easy"
    category: str = "Technical"
    number_of_questions: int = 5


class FollowUpRequest(BaseModel):
    role: str
    original_question: str
    candidate_answer: str
    difficulty: str = "Easy"


class InterviewResult(BaseModel):
    question: str
    candidate_answer: str
    evaluation: str


class FinalReportRequest(BaseModel):
    role: str
    difficulty: str
    category: str
    interview_results: list[InterviewResult]


# ==========================
# HOME
# ==========================


@app.get("/")
def home():

    return {
        "message": "AI Interview Assistant Running 🚀",
        "version": "2.0.0",
    }


# ==========================
# CANDIDATE CONTEXT
# ==========================


def get_candidate_context():

    if resume_text.strip():

        return f"""
The candidate has uploaded a resume.

Use ONLY the following resume information when referring to the
candidate's personal skills, projects, experience, education,
achievements, or qualifications.

CANDIDATE RESUME:

{resume_text}
"""

    return """
The candidate has not uploaded a resume.

Do not assume or invent the candidate's name, skills, projects,
experience, education, achievements, qualifications, or employment
history.

Generate general interview content based only on the selected job role.
"""


# ==========================
# NON-ENGLISH VALIDATION
# ==========================


def contains_non_english_characters(text):

    if not text:
        return False

    patterns = [
        r"[\u0400-\u04FF]",  # Cyrillic
        r"[\u3040-\u30FF]",  # Japanese
        r"[\u3400-\u4DBF]",  # Chinese
        r"[\u4E00-\u9FFF]",  # Chinese
        r"[\uAC00-\uD7AF]",  # Korean
    ]

    for pattern in patterns:

        if re.search(pattern, text):
            return True

    return False


# ==========================
# CLEAN AI TEXT
# ==========================


def clean_ai_text(text):

    if not text:
        return ""

    text = text.strip()

    text = text.strip('"')
    text = text.strip("'")

    return text.strip()


# ==========================
# HANDLE AI ERRORS
# ==========================


def handle_ai_error(error):

    error_message = str(error).lower()

    print("AI SERVICE ERROR:", error)


    if (
        "429" in error_message
        or "rate limit" in error_message
        or "rate_limit" in error_message
        or "free-models-per-day" in error_message
        or "temporarily rate-limited" in error_message
    ):

        raise HTTPException(
            status_code=429,
            detail=(
                "AI request limit reached. "
                "The free AI model is temporarily unavailable. "
                "Please try again later."
            ),
        )


    if (
        "401" in error_message
        or "authentication" in error_message
        or "invalid api key" in error_message
    ):

        raise HTTPException(
            status_code=401,
            detail=(
                "AI authentication failed. "
                "Please check the API configuration."
            ),
        )


    if (
        "timeout" in error_message
        or "timed out" in error_message
    ):

        raise HTTPException(
            status_code=504,
            detail=(
                "The AI service took too long to respond. "
                "Please try again."
            ),
        )


    raise HTTPException(
        status_code=500,
        detail=(
            "The AI service encountered an error. "
            "Please try again."
        ),
    )


# ==========================
# CALL AI
# ==========================


def call_ai(messages):

    try:

        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
        )


        if not completion.choices:

            raise HTTPException(
                status_code=500,
                detail="The AI service returned no response.",
            )


        content = completion.choices[0].message.content


        if not content:

            raise HTTPException(
                status_code=500,
                detail="The AI service returned an empty response.",
            )


        return clean_ai_text(content)


    except HTTPException:
        raise


    except Exception as error:

        handle_ai_error(error)


# ==========================
# CALL AI FOR ENGLISH OUTPUT
# ==========================


def call_ai_english(messages):

    output = call_ai(messages)


    if contains_non_english_characters(output):

        print(
            "WARNING: Non-English characters detected "
            "in AI output."
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "The AI generated invalid text. "
                "Please try again."
            ),
        )


    return output


# ==========================
# UPLOAD RESUME
# ==========================


@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...)
):

    global resume_text


    if file.content_type != "application/pdf":

        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file.",
        )


    contents = await file.read()


    maximum_file_size = 5 * 1024 * 1024


    if len(contents) > maximum_file_size:

        raise HTTPException(
            status_code=400,
            detail=(
                "Resume file is too large. "
                "Please upload a PDF smaller than 5 MB."
            ),
        )


    try:

        reader = PdfReader(
            BytesIO(contents)
        )


        extracted_pages = []


        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:

                extracted_pages.append(
                    page_text.strip()
                )


        extracted_text = "\n".join(
            extracted_pages
        )


        if not extracted_text.strip():

            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not extract text from the PDF. "
                    "Please upload a text-based PDF resume."
                ),
            )


        resume_text = extracted_text.strip()


        return {
            "message": "Resume uploaded successfully!"
        }


    except HTTPException:
        raise


    except Exception as error:

        print(
            "RESUME ERROR:",
            error,
        )


        raise HTTPException(
            status_code=500,
            detail="Could not read the resume PDF.",
        )


# ==========================
# ANALYZE RESUME
# ==========================


@app.post("/analyze-resume")
def analyze_resume(
    request: ResumeAnalysisRequest
):

    if not resume_text.strip():

        raise HTTPException(
            status_code=400,
            detail="Please upload a resume first.",
        )


    if not request.role.strip():

        raise HTTPException(
            status_code=400,
            detail="Please provide a target job role.",
        )


    messages = [

        {
            "role": "system",

            "content": f"""
You are an expert technical recruiter and resume reviewer.

Analyze the candidate resume for the selected target job role.


TARGET JOB ROLE:

{request.role}


CANDIDATE RESUME:

{resume_text}


Use exactly this format:


JOB MATCH SCORE: X/100


MATCHED SKILLS:

- Skill 1
- Skill 2
- Skill 3


MISSING OR WEAK SKILLS:

- Skill 1
- Skill 2
- Skill 3


RESUME STRENGTHS:

- Strength 1
- Strength 2
- Strength 3


RECOMMENDATIONS:

- Recommendation 1
- Recommendation 2
- Recommendation 3


FINAL ASSESSMENT:

Provide a short professional assessment.


RULES:

- Write only in English.
- Use clear natural English.
- Analyze only information available in the resume.
- Never invent experience.
- Never invent projects.
- Never invent skills.
- Never invent achievements.
- Never invent qualifications.
- Give a realistic score between 0 and 100.
- Keep the analysis concise and useful.
"""
        }

    ]


    analysis = call_ai_english(messages)


    return {
        "analysis": analysis
    }


# ==========================
# GENERATE AI ANSWER
# ==========================


@app.post("/answer")
def answer(
    request: InterviewRequest
):

    if not request.question.strip():

        raise HTTPException(
            status_code=400,
            detail="Please provide an interview question.",
        )


    if not request.role.strip():

        raise HTTPException(
            status_code=400,
            detail="Please provide a target job role.",
        )


    candidate_context = get_candidate_context()


    messages = [

        {
            "role": "system",

            "content": f"""
You are an expert interview coach.


TARGET JOB ROLE:

{request.role}


{candidate_context}


TASK:

Provide a strong sample answer to the interview question.


RULES:

- Write only in English.
- Use clear natural English.
- Tailor the answer to the selected job role.
- If a resume is available, use only information from the resume.
- If no resume is available, provide a general sample answer.
- Never invent candidate-specific information.
- Never invent companies.
- Never invent experience.
- Never invent projects.
- Never invent skills.
- Never invent achievements.
- Never invent qualifications.
- Keep the answer professional.
- Keep the answer natural.
- Keep the answer around 120 words.
"""
        },

        {
            "role": "user",
            "content": request.question,
        },

    ]


    generated_answer = call_ai_english(
        messages
    )


    return {
        "answer": generated_answer
    }


# ==========================
# GENERATE SINGLE QUESTION
# ==========================


@app.post("/generate-question")
def generate_question(
    request: QuestionRequest
):

    if not request.role.strip():

        raise HTTPException(
            status_code=400,
            detail="Please provide a target job role.",
        )


    candidate_context = get_candidate_context()


    messages = [

        {
            "role": "system",

            "content": f"""
You are a professional interviewer.


TARGET JOB ROLE:

{request.role}


DIFFICULTY:

{request.difficulty}


QUESTION CATEGORY:

{request.category}


{candidate_context}


TASK:

Generate exactly ONE interview question.


DIFFICULTY RULES:

Easy:
Ask basic concepts, definitions, simple experiences,
or introductory questions.

Medium:
Ask applied concepts, comparisons, project decisions,
debugging, or practical scenarios.

Hard:
Ask advanced concepts, architecture, optimization,
scalability, or challenging scenarios.


CATEGORY RULES:

HR:
Ask about motivation, strengths, weaknesses,
career goals, teamwork, or company fit.

Technical:
Ask a technical question relevant to the selected role.

Behavioral:
Ask about teamwork, challenges, failures,
conflicts, decisions, or situations.

Project-Based:
If a resume is uploaded, ask about a project from the resume.
If no resume is uploaded, ask a general project-based question
relevant to the role.

Resume-Based:
If a resume is uploaded, use ONLY information from the resume.
If no resume is uploaded, ask a general role-relevant question.


CRITICAL RULES:

- Write only in English.
- Generate exactly one question.
- Return only the question.
- Do not provide an answer.
- Keep the question under 40 words.
- Match the selected job role.
- Match the selected difficulty.
- Match the selected category.
- Keep the question clear and realistic.
"""
        }

    ]


    question = call_ai_english(
        messages
    )


    return {
        "question": question
    }


# ==========================
# PARSE QUESTIONS
# ==========================


def parse_questions(ai_output):

    try:

        parsed_data = json.loads(ai_output)


        if isinstance(parsed_data, list):

            questions = []


            for item in parsed_data:

                if isinstance(item, str):

                    cleaned_question = (
                        clean_ai_text(item)
                    )


                    if cleaned_question:

                        questions.append(
                            cleaned_question
                        )


            return questions


    except json.JSONDecodeError:

        pass


    questions = []


    for line in ai_output.splitlines():

        line = line.strip()


        if not line:
            continue


        line = re.sub(
            r"^\s*\d+\s*[\.\)\-:]\s*",
            "",
            line,
        )


        line = re.sub(
            r"^\s*[-*]\s*",
            "",
            line,
        )


        line = clean_ai_text(line)


        if line.endswith("?"):

            questions.append(line)


    return questions


# ==========================
# START INTERVIEW
# ==========================


@app.post("/start-interview")
def start_interview(
    request: StartInterviewRequest
):

    if not request.role.strip():

        raise HTTPException(
            status_code=400,
            detail="Please provide a target job role.",
        )


    if request.number_of_questions not in [
        5,
        10,
    ]:

        raise HTTPException(
            status_code=400,
            detail=(
                "Number of questions must be 5 or 10."
            ),
        )


    candidate_context = get_candidate_context()


    messages = [

        {
            "role": "system",

            "content": f"""
You are a professional interviewer.


TARGET JOB ROLE:

{request.role}


DIFFICULTY:

{request.difficulty}


QUESTION CATEGORY:

{request.category}


NUMBER OF QUESTIONS:

{request.number_of_questions}


{candidate_context}


TASK:

Generate exactly {request.number_of_questions}
unique interview questions.


DIFFICULTY RULES:

Easy:
Ask basic concepts, definitions, simple experiences,
or introductory questions.

Medium:
Ask applied concepts, comparisons, project decisions,
debugging, or practical scenarios.

Hard:
Ask advanced concepts, architecture, optimization,
scalability, or challenging scenarios.


CATEGORY RULES:

HR:
Ask about motivation, strengths, weaknesses,
career goals, teamwork, or company fit.

Technical:
Ask technical questions relevant to the selected role.

Behavioral:
Ask about teamwork, challenges, failures,
conflicts, decisions, or situations.

Project-Based:
If a resume is uploaded, use projects from the resume.
If no resume is uploaded, ask general project-based questions.

Resume-Based:
If a resume is uploaded, use ONLY information from the resume.
If no resume is uploaded, ask general role-relevant questions.


CRITICAL OUTPUT FORMAT:

Return ONLY a valid JSON array of strings.

Example:

[
    "Question one?",
    "Question two?",
    "Question three?"
]


CRITICAL RULES:

- Write only in English.
- Generate exactly {request.number_of_questions} questions.
- Return only the JSON array.
- Do not use Markdown.
- Do not use code fences.
- Do not provide answers.
- Every question must be unique.
- Every question must end with a question mark.
- Keep each question under 40 words.
- Match the selected role.
- Match the selected difficulty.
- Match the selected category.
- Keep questions clear and realistic.
"""
        }

    ]


    ai_output = call_ai_english(
        messages
    )


    questions = parse_questions(
        ai_output
    )


    if (
        len(questions)
        != request.number_of_questions
    ):

        print(
            "QUESTION PARSING ERROR"
        )

        print(
            "EXPECTED:",
            request.number_of_questions,
        )

        print(
            "RECEIVED:",
            len(questions),
        )

        print(
            "AI OUTPUT:",
            ai_output,
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "The AI could not generate the interview "
                "questions correctly. Please try again."
            ),
        )


    if len(set(questions)) != len(questions):

        raise HTTPException(
            status_code=500,
            detail=(
                "The AI generated duplicate questions. "
                "Please try again."
            ),
        )


    return {
        "questions": questions
    }


# ==========================
# EVALUATE ANSWER
# ==========================


@app.post("/evaluate-answer")
def evaluate_answer(
    request: EvaluationRequest
):

    if not request.candidate_answer.strip():

        raise HTTPException(
            status_code=400,
            detail="Please provide an answer to evaluate.",
        )


    messages = [

        {
            "role": "system",

            "content": f"""
You are an expert interviewer and interview coach.


TARGET JOB ROLE:

{request.role}


TASK:

Evaluate the candidate's answer fairly.


Use exactly this format:


SCORE: X/10


STRENGTHS:

- Strength 1
- Strength 2


IMPROVEMENTS:

- Improvement 1
- Improvement 2


FEEDBACK:

Give short constructive feedback.


BETTER ANSWER:

Provide an improved interview answer.


RULES:

- Write only in English.
- Give a realistic score between 1 and 10.
- Evaluate relevance to the question.
- Evaluate technical accuracy when applicable.
- Evaluate clarity.
- Evaluate completeness.
- Be constructive.
- Keep the response concise and useful.
"""
        },

        {
            "role": "user",

            "content": f"""
INTERVIEW QUESTION:

{request.question}


CANDIDATE ANSWER:

{request.candidate_answer}
"""
        },

    ]


    evaluation = call_ai_english(
        messages
    )


    return {
        "evaluation": evaluation
    }


# ==========================
# GENERATE FOLLOW-UP
# ==========================


@app.post("/generate-follow-up")
def generate_follow_up(
    request: FollowUpRequest
):

    messages = [

        {
            "role": "system",

            "content": f"""
You are a professional interviewer.


TARGET JOB ROLE:

{request.role}


DIFFICULTY:

{request.difficulty}


ORIGINAL QUESTION:

{request.original_question}


CANDIDATE ANSWER:

{request.candidate_answer}


TASK:

Generate exactly ONE relevant follow-up interview question.


RULES:

- Write only in English.
- Generate exactly one question.
- Return only the question.
- Do not provide an answer.
- Base the follow-up on the candidate's answer.
- Keep the question under 40 words.
- Keep the question relevant to the selected role.
- Do not repeat the original question.
- Keep the question clear and realistic.
"""
        }

    ]


    follow_up_question = call_ai_english(
        messages
    )


    return {
        "follow_up_question":
            follow_up_question
    }


# ==========================
# FINAL REPORT
# ==========================


@app.post("/final-report")
def final_report(
    request: FinalReportRequest
):

    if not request.interview_results:

        raise HTTPException(
            status_code=400,
            detail=(
                "No interview results are available."
            ),
        )


    results_text = ""


    for index, result in enumerate(
        request.interview_results,
        start=1,
    ):

        results_text += f"""

QUESTION {index}:

{result.question}


CANDIDATE ANSWER:

{result.candidate_answer}


EVALUATION:

{result.evaluation}


------------------------------

"""


    messages = [

        {
            "role": "system",

            "content": f"""
You are an expert interviewer and career coach.


TARGET JOB ROLE:

{request.role}


DIFFICULTY:

{request.difficulty}


CATEGORY:

{request.category}


INTERVIEW RESULTS:

{results_text}


TASK:

Generate a final interview performance report.


Use exactly this format:


OVERALL SCORE: X/10


PERFORMANCE SUMMARY:

Provide a concise summary.


TOP STRENGTHS:

- Strength 1
- Strength 2
- Strength 3


AREAS TO IMPROVE:

- Improvement 1
- Improvement 2
- Improvement 3


TECHNICAL ASSESSMENT:

Provide a short technical assessment.


COMMUNICATION ASSESSMENT:

Provide a short communication assessment.


FINAL RECOMMENDATION:

Provide practical advice for the candidate.


RULES:

- Write only in English.
- Give a realistic overall score between 1 and 10.
- Base the report only on the interview results.
- Do not invent candidate information.
- Be constructive.
- Keep the report concise and useful.
"""
        }

    ]


    report = call_ai_english(
        messages
    )


    return {
        "final_report": report
    }