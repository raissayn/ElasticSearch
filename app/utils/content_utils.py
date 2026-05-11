import re


def treat_content(content: str) -> str:
    content = re.sub(r"</?(som|math)\\d*>", "", content)
    content = re.sub(r"[^A-Za-z\\s]+", "", content)
    content = re.sub(r"\\s+", " ", content)
    content = re.sub(r"^\\s+", "", content)

    return content