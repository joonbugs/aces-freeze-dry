# Done so far:

1. Add todos and set them as active
2. Once active, the code associates the window id with that task
3. Any tabs opened in that window are added to the "tab" list for that task
4. Switching windows switches tasks
5. Clicking on a task will open its window (if already open), or open a new window (if it's not yet open)
6. If a tab is changed without opening a new tab (aka update) it is added as a part of the tab's history instead of a new tab.

# To Do:

Core features:

1. Tracking time spent on tabs and tasks
2. Basic CRUD for tasks and tabs (editing names, moving tabs to different tasks, adding tasks manually)

Bugs:

1. Differentiating between new tabs and updated tabs (sometimes when opening the tabs for a task in a new window, it adds them all to a list)
   1. This is especially a problem because tabs have a unique tabId when they are opened, but this does not persist across windows or sessions.
   2. This probably means we need some form of universal tabId tracking

# Notes:

`content_script.tsx` and `options.tsx` are from the TypeScript template for later in case we need to use them. They currently don't do much.

`popup.tsx` is the actual interface that shows up

`background.ts` is the backend that runs in the background called a service worker

You can debug with print statements by right clicking and then clicking `Inspect` on the actual popup.
