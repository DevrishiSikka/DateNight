from flask import Flask, render_template, request, jsonify
from pprint import pprint

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader

app = Flask(__name__)

# SMTP EMAIL HELPER FUNCTIONS
def sendEmailSMTP(data, recipient_email):
    # SMTP server configuration
    SMTP_SERVER = "smtp.gmail.com"  # Replace with your SMTP server (e.g., AWS SES)
    SMTP_PORT = 587
    SMTP_USERNAME = "memesofficialdrive@gmail.com"
    SMTP_PASSWORD = "canq ilmr utfy lfbe"

    # Email details
    sender_email = SMTP_USERNAME
    subject = "Looks like someone’s ready for the ultimate showtime!"

    # Load and render the HTML template
    def render_template(template_name, context):
        env = Environment(loader=FileSystemLoader("templates"))  # 'templates' folder
        template = env.get_template(template_name)
        return template.render(context)

    html_content = render_template("email_temp.html", data)
    # Create email message
    message = MIMEMultipart("alternative")
    message["From"] = sender_email
    message["To"] = recipient_email
    message["Subject"] = subject

    # Attach the HTML content
    message.attach(MIMEText(html_content, "html"))

    # Send the email
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Secure the connection
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(sender_email, recipient_email, message.as_string())
            print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {e}")

@app.route("/")
def movieIndexPage():
    return render_template("index.html")

@app.route("/sendEmail", methods=["POST"])
def sendEmail():
    try:
        data = request.json
        pprint(data)

        movie = data.get("movie")
        date = data.get("date")
        time = data.get("time")
        recipients = data.get("recipients")
        senderName = data.get("senderName")

        if not all([movie, date, time, recipients, senderName]):
            return jsonify({"message": "Missing required fields"}), 400

        for recipient in recipients:
            try:
                dynamic_data = {
                    "receiver_first_name": recipient["name"],
                    "date_names": senderName,
                    "movie_name": movie,
                    "date": date,
                    "time": time,
                }
                sendEmailSMTP(dynamic_data, recipient["email"])

            except Exception as e:
                print(f"Failed to send email to {recipient}: {str(e)}")
                return (
                    jsonify(
                        {
                            "message": f"Failed to send email to {recipient}",
                            "error": str(e),
                        }
                    ),
                    500,
                )

        return jsonify({"message": "Emails sent successfully"}), 200

    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
