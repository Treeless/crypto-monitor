import re
import tweepy
import collections
import json
from tweepy import OAuthHandler
from textblob import TextBlob
from nltk.sentiment.vader import SentimentIntensityAnalyzer as SIA


parsed_tweets = user_timeline(id = 'officialmcafee', count = 2) # fetches tweet from USER

print(parsed_tweet['text'])