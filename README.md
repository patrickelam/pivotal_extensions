# Pivotal Extensions

Inspired by [Story Time](https://github.com/bertrandmoulard/story_time/tree/master), the purpose of this extension is to make tweaks to Pivotal Tracker's UI to enhance usability. The first piece of functionality is (like Story Time), to set a visual indicator of how long a card has been in progress; but several other features are planned.

Pivotal Extensions uses the authentication information of the logged-in user to commicate with Pivotal's API, instead of asking the user for their API key. This is both more convenient and more secure, as nothing is stored in local storage except the preferences for the extension.