var sys = require('sys'),
    fs = require('fs'),
    Faker = require('./public/js/Faker.js'),
    mongoose = require('mongoose')


var profiles = []
// ***Profile***
// fullName: {type: String, default: ''},
// username: {type: String, default: ''},
// email: {type: String, default: ''}

for (i = 0; i <= 5; i++) {
  var firstName = Faker.Name.firstName()
  var lastName = Faker.Name.lastName()
  profiles.push(
    {
      _id: mongoose.Types.ObjectId(),
      fullName: firstName + " " + lastName,
      email: firstName.toLowerCase() + "." + lastName.toLowerCase() + "@" + Faker.Internet.domainName(),
      username: firstName[0].toLowerCase() + lastName.toLowerCase()
    })
}

var listings = []
// ***Listing***
// displayName: {type: String, default: ''},
// universalName: {type: String, default: ''},
// listingUrl: {type: String, default: ''}

for (i = 0; i <= 10; i++) {
  var word1 = Faker.Internet.domainWord()
  var word2 = Faker.Internet.domainWord()
  listings.push(
    {
      _id: mongoose.Types.ObjectId(),
      universalName: "com." + word2 + "." + word1,
      displayName: word1 + " " + word2,
      listingUrl: "www." + word1 + word2 + ".com"
    })
}

var metrics = []
// ***Metric***
// listing:    { type : Schema.ObjectId, ref : 'Listing' },
// profile:    { type : Schema.ObjectId, ref : 'Profile'},
// timestamp:  { type: String, default: Date.now },
// userAgent:  { type: String },
// siteUrl:    { type: String },
// metricType: { type: String, default: 'view' }, //view, download, comment, search
// attributes: {
//   commentText: { type: String },
//   commentRating: { type: Number },
//   searchTerm: { type: String }

var userAgents = ["Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.76 Safari/537.36", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:23.0) Gecko/20100101 Firefox/23.0", "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)"]
var siteUrls = ['https://www.google.com/marketplace', 'https://www.yahoo.com/marketplace', 'https://www.bing.com/marketplace']
var startDate = new Date(2011, 0, 1)
var endDate = new Date()
for (i = 0; i <= 50; i++) {
  metrics.push(
  {
    listing: listings[Math.floor(Math.random() * listings.length)]._id,
    profile: profiles[Math.floor(Math.random() * profiles.length)]._id,
    userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
    siteUrl: siteUrls[Math.floor(Math.random() * siteUrls.length)],
    timestamp: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())),
    metricType: 'comment',
    attributes: {
      commentText: Faker.Lorem.paragraph(),
      commentRating: Math.floor((Math.random()*5)+1)
    }
  })

  metrics.push(
  {
    profile: profiles[Math.floor(Math.random() * profiles.length)]._id,
    userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
    siteUrl: siteUrls[Math.floor(Math.random() * siteUrls.length)],
    timestamp: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())),
    metricType: 'search',
    attributes: {
      searchTerm: Faker.Lorem.words(1)
    }
  })
}

for (i = 0; i <= 100; i++) {
  var types = ['view', 'download']
  metrics.push(
  {
    listing: listings[Math.floor(Math.random() * listings.length)]._id,
    profile: profiles[Math.floor(Math.random() * profiles.length)]._id,
    userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
    siteUrl: siteUrls[Math.floor(Math.random() * siteUrls.length)],
    metricType: types[Math.floor(Math.random() * types.length)],
    timestamp: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
  })
}

fs.writeFile('./scaffolds/profiles.json', JSON.stringify(profiles), function() { console.log('Profiles generated')})
fs.writeFile('./scaffolds/listings.json', JSON.stringify(listings), function() { console.log('Listings generated')})
fs.writeFile('./scaffolds/metrics.json', JSON.stringify(metrics), function() { console.log('Metrics generated')})