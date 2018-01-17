""" Twitter Sentiment Analyzer

Authors: Michael Dragan; Eliot Boyd

This module sifts through the tweets and retweets of a specified twitter page,
compartmentalize the tweets based off their sentiment, and stores their content
in three .txt files (neg_tweets, pos_tweets, and neu_tweets).

Required Libraries:
- re
- tweepy
- from tweepy import OAuthHandler
- nltk

IMPORTANT: On your python interpreter, please input the following:
import nltk nltk.download()
    - install all the packages within the window that pops up.

TODO:
- Should we remove retweets? Who should we 
follow?

- Graphs numpy/matplotlab

- For some reason, arbitrary numbers (ex. 1, 5) appear as tweets or retweets
within the neutral list. Find out why and how to remove these from the list.

- Improve code documentation for better readability
"""
import re
import tweepy
from tweepy import OAuthHandler
from nltk.sentiment.vader import SentimentIntensityAnalyzer as SIA

class TwitterClient(object):
    """Class that uses the twitter API"""

    def __init__(self):
        """Keys and tokens from twitter dev console"""
        consumer_key = '9DTwWsyG7fW8kOwjAeVAcewTn'
        consumer_secret = 'wYe6CC9IFSYWpD3Aw7VOPUQTKcBRBXLlzkynQZIPNO0N2WObXq'
        access_token = '140572718-iEofi8MBOS8akd4iqf1LpBX1xbo4SPHXxqgKhOC3'
        access_token_secret = 'xDTkuECXVK7iMj5slevgqrV1Pqj2vXTpqormkFeqvvjAK'

        try: # Authentication attempt
            self.auth = OAuthHandler(consumer_key, consumer_secret) # Creates OAuthHandler object
            self.auth.set_access_token(access_token, access_token_secret) # Sets access
            self.api = tweepy.API(self.auth) #tweepy api object that fetches tweets
        except:
            print("Error: Authentification Failed") #TODO exception type

    def clean_tweet(self, tweet):
        """method clean_tweet removes links, special chars from tweets"""
        return ' '.join(re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)", " ", tweet).split())
    
    def get_tweet_sentiment(self, tweet):
        """ Returns value (double) of sentiment of each tweet """
        sia = SIA()
        result = sia.polarity_scores(self.clean_tweet(tweet))

        return result['compound']

    def get_tweets(self, id):
        """ Returns list of most recent tweets andfrom a Twitter account.
        
        Uses get_tweet_sentiment in order to store tweet sentiment.
        """
        tweets = [] #  list that stores twitter statuses
        
        try:
            fetched_tweets = self.api.user_timeline(id = id, include_rts = 'false', count = 3200) # fetches tweet from USER
            
            for tweet in fetched_tweets:
                parsed_tweet = {}  # Dictionary stores tweet's text and sent
                parsed_tweet['text'] = self.clean_tweet(tweet.text)
                parsed_tweet['sentiment'] = self.get_tweet_sentiment(tweet.text)

                if tweet.retweet_count > 0:  # Add retweets not in tweets dic
                    if parsed_tweet not in tweets:  
                        tweets.append(parsed_tweet) 
                else:
                    tweets.append(parsed_tweet)
            
            return tweets
        
        except tweepy.TweepError as e:
            print("Error : " + str(e))

def main():
    """
    Instantiates twitter client, retrieves tweets, categorizes tweets into 
    positive, neutral, or negative lists. Optional to print tweets from each 
    list. Lastly, saves the tweets in .txt files. 
    """
    api = TwitterClient() # creating object of TwitterClient Class
    bitcoint_tweets = api.get_tweets('Bitcoin') # fetches tweets from @Bitcoin
    ripple_tweets = api.get_tweets('Ripple') # fetches tweets from @Ripple
    eth_tweets = api.get_tweets('ethereumproject') #fetches tweets from ethereum
    influential_person = api.get_tweets('bgarlinghouse') #fetches tweets from @bgarlinghouse

    def print_totals(tweets):
        pos_lis, neg_lis, neu_lis = [], [], []
        pos_count, neg_count, neu_count, total_count = 0, 0, 0, 0
       
        for tweet in tweets: # For loops categorizes tweets based off of sentiment.
            if tweet['sentiment'] > 0.4:
                pos_lis.append(tweet)
                pos_count += 1
                total_count += 1
            elif tweet['sentiment'] < -0.4:
                neg_lis.append(tweet)
                neg_count += 1
                total_count += 1
            else:
                neu_lis.append(tweet)
                neu_count += 1
                total_count += 1

        print("Total number of tweets and retweets: " + str(total_count))
        print("\033[0;32;47mNumber of positive tweets and retweets: " + str(pos_count))
        print("\033[1;33;40mNumber of neutral tweets and retweets: " + str(neu_count))
        print("\033[0;31;47mNumber of negative tweets and retweets: " + str(neg_count))

        if neg_count != 0:
            ratio = pos_count / neg_count
            print("\033[0;34;47mPositive to negative ratio: " + str(format(ratio, '.2f')) + "\n")
        """
        with open("pos_tweets.txt", "w", encoding='utf-8', errors='ignore') as p_tweet:
            for tweet in pos_lis:
                p_tweet.write(str(tweet['text']) + "\n")

        with open("neg_tweets.txt", "w", encoding='utf-8', errors='ignore') as n_tweet:
            for tweet in neg_lis:
                n_tweet.write(str(tweet['text']) + "\n")

        with open("neu_tweets", "w", encoding='utf-8', errors='ignore') as neu_tweet:
            for tweet in neu_lis:
                neu_tweet.write(str(tweet['text']) + "\n")

        for tweet in pos_lis:
            print("\033[0;32;47mTweet: " + tweet['text'] + "\nSentiment:  " + str(tweet['sentiment']) + "\n")
    
        for tweet in neg_lis:
            print("\033[0;31;47mTweet: " + tweet['text'] + "\nSentiment:  " + str(tweet['sentiment']) + "\n")
    
        for tweet in neu_lis:
            print("\033[1;33;40mTweet: " + tweet['text'] + "\nSentiment:  " + str(tweet['sentiment']) + "\n")
        """

    print_totals(bitcoint_tweets)
    print_totals(ripple_tweets)
    print_totals(eth_tweets)
    print_totals(influential_person)

if __name__ == "__main__":
    # calling main function
    main()