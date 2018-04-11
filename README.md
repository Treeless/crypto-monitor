# Cryptosense: Frontend for TrentU 4000Y Course project
Author: Matthew Rowlandson @Treeless

Cryptosense: Machine Learning based predictions of hourly bitcoin prices based on price history, currency volume and community sentiment. We wanted to see if we could accurately predict future prices in such a volatile market using an LSTM model. 

This REPO is the front end for the project. 

## Technologies we need to install

1. NodeJS 8.4+
2. MongoDB 3.6 (install this as a service)

## How to get the application running
First ensure, you have the backend python prediction system and have done all the data collecting. See [SMSA](http://www.github.com/MichaelDragan/SMSA).

To run the frontend:
1. `npm install`
2. `gulp`
3. Now, navigate to `http://localhost` in your browser.

---
# NOTE: anything below is mostly for the devs
## TODO LIST
* SMSA - Start making daily predictions, only next day prediction
* Cryptosense - Show volume for both hourly and daily prices as a chart
* Final presentation

---
## WEEKLIES:
Final Presentation (April 18th 2016) - <strong>2018-04-06</strong>
What the presentation entails:
* Who we are (Photos)? This will be very good. The best part of the presentation. 
* What our project is, why we decided to do it
* DEMO of app (quick sneakpeak, highlight how ez pz it is to use)
* Non-technical explanation with Workflow model, how things work. Data gathering, processing, prediction, ui
* Architectural Diagram (UML component model) - UI, apis, interfaces) with (APIs we are using + where we are using them)
* Class Diagrams for each part of the workflow
* How the prediction model works [LSTM, inputs (pattern recognition)] - SUPER TECHNICAL
* Where we started (twitter script for sentiment) : Research we did
* Where we ended up - Making predictions for future price changes (based on sentiment/price)
* Show picture of all out slides merged together, just so people can think for a second.
* Future work (talk about your reading course, exploring other machine learning algos, improving the algorithm to get even more accurate predictions)
* QUESTIONS? :)
---

After presentation 2 (beta) - <strong>2018-03-02</strong>
* prediction model
     * Omar wants to see the predicted price for the next day
     * Multiple coins - ETH, Ripple, BTC
* Webapp:
     * He wants to be able to input an influencer and get their sentiment compared to the bitcoin price
     * I want to show influencer tweets on the bitcoin price frame we are showing
* Documentation
*     UMLs for the both the prediction model, AND twitter bot
*     Final Presentation 

--
Rest of the weeklies were just chit chat...
We ended up choosing to strictly use twitter and sentiment combined with the bitcoin price.
--

Talking with OMAR - <strong>2017-11-03</strong>
* <em>Issue</em>: No subreddit traffic api, has been deprecated
* <strong>Recommended Solution</strong>: Create a library for subreddit post engagement evaluation. (we can also mine news articles during this process)
* RESEARCH: Papers -> Engagement - HISTORY
* How do they mine? Posts for engagement. Formula? Weights ;)
* Information Retrieval Papers
* Japan, wikipedia, scraping. Rank based on importance. What can we pull from these examples?
* <strong>OUTCOME</strong>: We need to create a library that will pull in reddit posts from a specific subreddit and rank each post based on upvotes, comments, golded comments, and all out engagement. Then using the ranking system, graph the weights alongside the price of the coin.
