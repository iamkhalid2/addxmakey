from app import app

# This is the entry point that Vercel looks for
if __name__ == "__main__":
    app.run()

# For Vercel serverless deployment
app = app