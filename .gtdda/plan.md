# Test Plan

## Test Scenarios

[x] When interactiveSelect receives Ctrl+C keypress then it returns a cancellation signal
[x] When user presses 'n' then interactiveSelect quits.
[x] When interactiveSelect is called with a list of packages then all provided packages are selected by default.
[x] When user hits 'enter' then selected updates are returned by interactiveSelect.
[x] When all items are selected and user hits 'a' then all items are deselected.
[x] When some items are selected and user hits 'a' then all items are selected.
[x] When no items are selected and user hits 'a' then all items are selected.
[x] When winget output indicates no updates then getUpdateCandidates returns empty list.
[x] When the system locale is unsupported then fallback to en.
[x] When the system locale is unsupported print an appropriate warning and continue with default locale.
[x] When winget outputs a list of available updates, getUpdateCandidates should return these updates as array of { name, id, currentVersion, availableVersion }
[x] When ignore list exists in user home then all contained package ids should be put on an ignore list.
[x] When an ignore list has been loaded then contained package ids should be removed from update candidates.
[x] When app is started without any arguments then ignore list is loaded from the file .fwguignore which is assumed to be located in the user's home dir.
[x] When app is started with argument --ignore-file <path> then ignore list is loaded from file <path>.
[x] When ignore file contains lines starting with '#' then ignore those lines.
[x] Lines from ignore file are propperly trimmed.
[x] When reading from ignore file fails then log error and exit.
[x] When ignore file contains empty lines then ignore those lines.
[x] askPermissionToContinue uses provided input and output streams.