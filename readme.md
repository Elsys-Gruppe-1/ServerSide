# Stimle Server Side
This github repo contains all the server side processing and hosting for the Stimle project, the project is split into two parts, the webpage and the **processing_client**.

## How to run
Start by runing:
```pip install -r requirements.txt``` 
In the terminal, this downloads all the necessary packages for running the project. AFter all these are installed, run app.py

## Processing Client
The processing client is just an script ran to process images uploaded to the server, this is made to restirct the pressure on the server and allow for testing of large models whithout straining the server.


## Live server
We are currently running the server on https://stimle.elektra.io/ tu update the live server with newest data from the github, firsly make sure that you have pushed and synced changes, then go to https://stimle.elektra.io/update_server after visiting this page the https://stimle.elektra.io/ server should update with the newest code. 