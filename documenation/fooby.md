[Sitemap](https://medium.com/sitemap/sitemap.xml)

[Open in app](https://rsci.app.link/?%24canonical_url=https%3A%2F%2Fmedium.com%2Fp%2F3c518f2d6ebb&%7Efeature=LoOpenInAppButton&%7Echannel=ShowPostUnderUser&%7Estage=mobileNavBar&source=post_page---top_nav_layout_nav-----------------------------------------)

Sign up

[Sign in](https://medium.com/m/signin?operation=login&redirect=https%3A%2F%2Fmedium.com%2F%40blog.oliverherzig%2Fexploring-the-nofficial-fooby-ch-api-a-comprehensive-guide-3c518f2d6ebb&source=post_page---top_nav_layout_nav-----------------------global_nav------------------)

[Medium Logo](https://medium.com/?source=post_page---top_nav_layout_nav-----------------------------------------)

[Write](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2Fnew-story&source=---top_nav_layout_nav-----------------------new_post_topnav------------------)

[Search](https://medium.com/search?source=post_page---top_nav_layout_nav-----------------------------------------)

Sign up

[Sign in](https://medium.com/m/signin?operation=login&redirect=https%3A%2F%2Fmedium.com%2F%40blog.oliverherzig%2Fexploring-the-nofficial-fooby-ch-api-a-comprehensive-guide-3c518f2d6ebb&source=post_page---top_nav_layout_nav-----------------------global_nav------------------)

![](https://miro.medium.com/v2/resize:fill:64:64/1*dmbNkD5D-u45r44go_cf0g.png)

# Exploring the unofficial fooby.ch API: A Comprehensive Guide

[![Oliver Herzig](https://miro.medium.com/v2/resize:fill:64:64/1*i6xiTbH5AHX9Tcj-tbFSBA.jpeg)](https://medium.com/@blog.oliverherzig?source=post_page---byline--3c518f2d6ebb---------------------------------------)

[Oliver Herzig](https://medium.com/@blog.oliverherzig?source=post_page---byline--3c518f2d6ebb---------------------------------------)

Follow

6 min read

·

Jan 1, 2023

Listen

Share

Today, I'm going to be discussing an API that I stumbled upon quite by accident while analysing my favourite food website, [fooby.ch](https://fooby.ch/). This API was not something that was advertised or documented, but through some digging and experimentation, I was able to uncover its existence.

In this post, I’ll talk about how I discovered this API and how it works. I’ll also discuss the potential risks and benefits of using undocumented APIs, give a conclusion and an outlook over the possible further discoverable functionality of the API.

So without further ado, let’s dive in and see what we can learn from this accidental API discovery.

## Discovery

As I was searching for an API that could provide access to recipes, I was unable to locate any official options from the websites I typically use for this purpose. However, past experience has taught me that it can be beneficial to thoroughly examine potential resources.

As a result, I began experimenting with the search field while monitoring the network traffic tab in the browser’s developer tools. I specifically focused on API calls that returned JSON responses, and through this process, I was able to uncover the following API call:

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*4AtbPb3gNcLuIKGxh6Vvqw.png)

Network traffic from [fooby.ch](https://fooby.ch/)

In detail, it looked like this:

```
URL: https://fooby.ch/hawaii_search.sri?query=Soups&lang=en&treffertyp=rezepte&start=0&num=12&interface=hawaii&userquery=true
Status: 200 OK
Initiator: search-controller.js:324
```

As demonstrated in the API call, the search term ‘Soups’ is included among the query parameters. The response to this request appears as follows:

```
{
    "query": {...},
    "filters": {...},
    "resultcounts": {...},
    "results": [\
          {\
              "url": "https://fooby.ch/en/recipes/9129/vaud-sausages",\
              "treffertyp": "rezepte",\
              "treffertyp_sub": "rezept",\
              "title": "Vaud sausages",\
              "keyvisual": "9129",\
              "recipe_id": "9129",\
              "dauer_aktiv": "25",\
              "dauer_gesamt": "70",\
              "likes": "506",\
              "hasvideo": "false",\
              "logo": "Miini Region",\
              "hassteps": "false",\
              "season": [...],\
              "monat": [...],\
              "monatname": [...],\
              "pubdate": "02.11.2015"\
           },\
    ...]
}
```

The API call discovered during the search process contained a wealth of useful information, including the actual search results displayed on the webpage, making it a promising resource.

To verify that the URL could be accessed from external sources (see [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) for more information), a new private browser window was opened and the API call was executed. To my surprise, the same response was returned as seen in the network tab. To test this for yourself, you may use the following link:

[https://fooby.ch/hawaii\_search.sri?query=Soups&lang=en&treffertyp=rezepte&start=0&num=12&interface=hawaii&userquery=true](https://fooby.ch/hawaii_search.sri?query=Soups&lang=en&treffertyp=rezepte&start=0&num=12&interface=hawaii&userquery=true)

To identify all available query parameters, I initially experimented with the filters on the website. While adjusting and resetting the filters, I monitored the network calls to gain an understanding of their impact. Upon further examination, I realized that all necessary information was already present in the API’s response. The available filters were included as part of the response:

```
"filters": {
    "treffertyp": [...],
    "inhaltsart": [...],
    "menuart": [...],
    "region": [...],
    "anlass": [...],
    "ernaehrungsweise": [...],
    "authorid": [...],
    "hasvideo": [...],
    "hassteps": [...],
    "monat": [...],
    "season": [...],
    "zeitaufwand": {...},
    "zeitaufwand_aktiv": {...}
}
```

In addition to the various filters, the corresponding available values are also provided:

```
"treffertyp": [\
    {\
        "name": "rezepte",\
        "count": 6102,\
        "value": "rezepte",\
        "selected": true\
    },\
    {\
        "name": "kochschule",\
        "count": 284,\
        "value": "kochschule",\
        "selected": false\
    },\
    {\
        "name": "foobyversum",\
        "count": 121,\
        "value": "foobyversum",\
        "selected": false\
    },\
    {\
        "name": "kleinekochwelt",\
        "count": 36,\
        "value": "kleinekochwelt",\
        "selected": false\
    }\
]
```

In the final step, I utilized [Postman](https://www.postman.com/) to further explore the optional and required parameters of the API. I was fortunate to find that the error messages provided by the API were detailed and informative:

```
{
    "response": {
        "action": "hawaii_search",
        "method": "GET",
        "error": "unknown",
        "status": "error",
        "message": "Required String parameter 'lang' is not present"
    }
}
```

Detailed instructions on how to search for recipes on fooby.ch will be presented in the following chapter.

## Usage

The API for fooby.ch allows for the search and retrieval of recipes. By utilizing various parameters, the API offers a wider range of filtering options compared to the website’s search function.

The endpoint for the API is as follows:

```
GET [https://fooby.ch/hawaii\_search.sri](https://fooby.ch/hawaii_search.sri)
```

The following parameter can be utilized to filter the search results:

Query parameters

If it is desired to set multiple values for a parameter, it is necessary to include the parameter multiple times in the request. For example, to search for recipes from both Switzerland and Italy (in this case, the ‘region’ parameter is set twice):

```
GET https://fooby.ch/hawaii_search.sri?lang=en&treffertyp=rezepte&region=switzerland&region=italian
```

It is possible to determine the values for each parameter by making a call with only the required parameters included:

```
GET [https://fooby.ch/hawaii\_search.sri?lang=en&treffertyp=rezepte](https://fooby.ch/hawaii_search.sri?lang=en&treffertyp=rezepte)
```

To avoid cluttering this document with an exhaustive list of values for each parameter, it is recommended to refer to the API call provided for the complete and up-to-date list of parameters. The values for these parameters can be found within the ‘filters’ section of the API response:

```
{
    "query": {...},
    "filters": {
        "treffertyp": [...],
        "inhaltsart": [...],
        "menuart": [...],
        "region": [...],
        "anlass": [...],
        ...
    },
    "resultcounts": {...},
    "results": [...]
}
```

## Risks and benefits of using undocumented APIs

Using undocumented APIs can be risky because they are not officially supported by the provider and are not guaranteed to be stable or reliable. They may change or break without notice, causing problems for the applications that rely on them. This can lead to unexpected downtime, data loss, and other issues that can be costly and time-consuming to fix.

On the other hand, undocumented APIs may offer functionality that is not available through the officially supported APIs. This can be particularly useful for developers who need to access certain data or functionality that is not exposed through the official channels.

However, it is important to carefully weigh the risks and benefits before using undocumented APIs. If the potential benefits outweigh the risks, it may be worth using an undocumented API, but it is essential to be prepared for the possibility of problems and to have a plan in place to deal with them if they occur.

Developers should also be aware of any legal or ethical implications of using undocumented APIs. In some cases, the use of undocumented APIs may be considered a violation of the terms of service or may be illegal. It is important to understand and comply with all relevant laws and terms of service when using undocumented APIs.

Overall, the decision to use undocumented APIs should be made with careful consideration and a clear understanding of the potential risks and benefits.

## Conclusion

The process of discovering and analysing the fooby.ch recipes API proved to be an enriching and informative experience. The API offers a wider range of functionality compared to the website’s search feature, making it suitable for building a recipe recommendation chatbot for personal use. However, due to the potential risk of the API being altered or blocked, it would not be advisable to utilize it for the development of a public application.

To me, it’s unclear why some companies do not make their API publicly available, as this decision could potentially offer numerous benefits:

- It is essential for a public API to have comprehensive documentation to ensure ease of use for external developers. Adequate documentation can also facilitate internal implementation and utilization of the API.
- The API presents an opportunity for monetization, potentially providing a new source of revenue for the company.
- The implementation of an API has the potential to attract a larger user base and expand the reach of the service. The development of new applications utilizing the API could further increase user engagement and facilitate the collection of additional user data.

It is hoped that the contents of this blog post will not result in alterations to the API that compromise the functionality described within this article.

## Outlook

During the search for recipe APIs, no options were identified for retrieving specific information such as ingredients and instructions. However, while examining the HTML file of a particular recipe, the following was discovered:

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*D5X-M4sH22I7SI8BLo0Akw.png)

Excerpt from the HTML template of a specific recipe

Utilizing a Python script to extract the desired information from the HTML file appears to be a feasible option. However, it is possible that there may also be an API available for directly accessing this information, which simply needs to be located.

[API](https://medium.com/tag/api?source=post_page-----3c518f2d6ebb---------------------------------------)

[Web Development](https://medium.com/tag/web-development?source=post_page-----3c518f2d6ebb---------------------------------------)

[Api Development](https://medium.com/tag/api-development?source=post_page-----3c518f2d6ebb---------------------------------------)

[![Oliver Herzig](https://miro.medium.com/v2/resize:fill:96:96/1*i6xiTbH5AHX9Tcj-tbFSBA.jpeg)](https://medium.com/@blog.oliverherzig?source=post_page---post_author_info--3c518f2d6ebb---------------------------------------)

[![Oliver Herzig](https://miro.medium.com/v2/resize:fill:128:128/1*i6xiTbH5AHX9Tcj-tbFSBA.jpeg)](https://medium.com/@blog.oliverherzig?source=post_page---post_author_info--3c518f2d6ebb---------------------------------------)

Follow

[**Written by Oliver Herzig**](https://medium.com/@blog.oliverherzig?source=post_page---post_author_info--3c518f2d6ebb---------------------------------------)

[5 followers](https://medium.com/@blog.oliverherzig/followers?source=post_page---post_author_info--3c518f2d6ebb---------------------------------------)

· [8 following](https://medium.com/@blog.oliverherzig/following?source=post_page---post_author_info--3c518f2d6ebb---------------------------------------)

I am constantly looking for ways to make a positive impact through the use of technology and always excited to take on new challenges.

Follow

## No responses yet

![](https://miro.medium.com/v2/resize:fill:32:32/1*dmbNkD5D-u45r44go_cf0g.png)

Write a response

[What are your thoughts?](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40blog.oliverherzig%2Fexploring-the-nofficial-fooby-ch-api-a-comprehensive-guide-3c518f2d6ebb&source=---post_responses--3c518f2d6ebb---------------------respond_sidebar------------------)

Cancel

Respond

[Help](https://help.medium.com/hc/en-us?source=post_page-----3c518f2d6ebb---------------------------------------)

[Status](https://status.medium.com/?source=post_page-----3c518f2d6ebb---------------------------------------)

[About](https://medium.com/about?autoplay=1&source=post_page-----3c518f2d6ebb---------------------------------------)

[Careers](https://medium.com/jobs-at-medium/work-at-medium-959d1a85284e?source=post_page-----3c518f2d6ebb---------------------------------------)

[Press](mailto:pressinquiries@medium.com)

[Blog](https://blog.medium.com/?source=post_page-----3c518f2d6ebb---------------------------------------)

[Privacy](https://policy.medium.com/medium-privacy-policy-f03bf92035c9?source=post_page-----3c518f2d6ebb---------------------------------------)

[Rules](https://policy.medium.com/medium-rules-30e5502c4eb4?source=post_page-----3c518f2d6ebb---------------------------------------)

[Terms](https://policy.medium.com/medium-terms-of-service-9db0094a1e0f?source=post_page-----3c518f2d6ebb---------------------------------------)

[Text to speech](https://speechify.com/medium?source=post_page-----3c518f2d6ebb---------------------------------------)

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)