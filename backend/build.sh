#!/bin/bash
set -e
apt-get update -qq
apt-get install -y -qq tesseract-ocr tesseract-ocr-fra tesseract-ocr-ara poppler-utils
pip install --upgrade pip
pip install -r requirements.txt