# ARE YOU BOYS READY FOR THIS?!

## Technologies we need to install

1. NodeJS 8.4+
2. MongoDB (install this as a service)

## How to get the application running

1. `npm install`
2. `gulp`
3. Now, navigate to localhost:80 in your browser.

## TODO LIST
1. work together on getting posts from a coins subreddit, and evaluating and ranking the post based on engagement
2. a news article listing system based on a coin. So finding articles on reddit and saving their links
3. coin prices charted from that api NAKUL found

## WEEKLIES:

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

