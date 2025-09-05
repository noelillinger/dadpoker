from uvicorn import run

# Run uvicorn in reload mode while permanently excluding noisy paths like .venv and .git
# Usage: python dev.py

if __name__ == "__main__":
    run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_excludes=[
            ".venv/*",
            ".git/*",
            "**/__pycache__/*",
            "**/*.pyc",
        ],
    )


