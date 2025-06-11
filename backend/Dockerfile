# Use the official Python image as the base image
FROM python:3.11-slim

# Ensure BE logs (stdout + stderr) stream to container logs
ENV PYTHONUNBUFFERED=1

# Install poetry
RUN pip install --no-cache-dir poetry

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY pyproject.toml poetry.lock ./

# Update the poetry.lock file
RUN poetry lock --no-update

# Install dependencies using poetry
RUN poetry install --no-root

#RUN pip install --no-cache-dir --upgrade -r /app/pyproject.toml

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Set the command to run the application
#CMD ["gunicorn", "--bind", "0.0.0.0:5000", "main:app"]
CMD ["poetry", "run", "gunicorn", "--bind", "0.0.0.0:8000", "main:app"]