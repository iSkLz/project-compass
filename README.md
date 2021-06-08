# Project Compass
Welcome to the Project Compass repository! This document attempts at explaining what Project Compass is, the concepts behind it and why it could be useful. The document is in the format of Q/As.

# Concepts and acronyms
PC => Project Compass

ME => Modding environment

Package => A single modding tool existing within a modding environment.

Library package => A collection of modding functionality embedded within an installable ME package for use by other packages.

Mod package => An ME package bundled with a mod (that would be loaded in the game).

# What is Project Compass?
Project Compass is a barebone generic implementation of a modding environment.

# What is an ME?
A modding environment is an app that installs, manages and loads modding tools (packages) and allows them to work with each other to ultimately improve the modding experience. Modding environments ship with built-in common packages.

# What is the difference between PC and an ME?
Project Compass is simply a potential starting point for the development of a modding environment. It provides an implemenation of the main functionality and helps enforce concepts and standards. It's also performant, built on Electron, and includes a collection of useful libraries, making development on it far easier than starting on your own.

# What is more useful in an ME than standalone modding tools?
To understand why an ME can be more useful, we first need to know the fundemental concepts of its design:

*   All-in-one:
    MEs shall strive to have everything included in the same app, minimizing external resources as much as possible. As is obvious, it is impossible to completely not rely on anything external, like it is with IDEs and code editors, but this concept should be applied whenever viable.

*   Hoisted resources:
    MEs encourage hoisting resources to the lowest viable level as much as possible. This includes libraries, code and content. If a package utilizes a new file format, said format's parser should be hoisted one level higher into a separately maintained library package. This induces reusability and compatibility as shown later.

Those concepts imply:

*   Shared assets and resources:
    Packages can share code, assets and resources, greatly increasing performance and reducing the amount of duplicate files.

*   Package interaction:
    Since packages coexist in one app, it's very easy for them to communicate and coordinate. It IS possible to do this with traditional tooling setups, but an ME makes that process easier, less expensive on system resources and more consistent across platforms.

*   Package customizability:
    When mods that edit vanilla game functionality on which some modding tools depend exist, things start to get a bit complicated. MEs with their fundemental concept of hoisting code can greatly reduce the difficulty of those complications.
    Suppose there is a vanilla file format, and one mod introduces very big changes to that format. In a perfect ME, the parser for the format would exist in a separate library package, on which all packages depend. And in that case, the mod can simply alter the parser to get it to work without having to update any package at all.
    
*   Improved user experience:
    It's quite a bit easier to work on a mod when all the tools exist in the same app. It's easier to switch between them and you don't have to launch each one individually.
    Moreover, the all-in-one design of MEs allows packages to automate a lot of work that otherwise would have to be done manually, such as building the mod and compiling the assets and packaging it.
    Furthermore, users can customize the app overall and have all packages adhere to their preferences.

Depending on how the ME is built, there can be more benefits to MEs. For instance, game assets can be loaded into the memory and used by all packages without duplication, only one instance of the assets exists in the RAM.

Best of all, any aspect of modding and modding tool development is rarely worse on an ME than on a standalone tool. MEs improve the overall experience and retain the original experience as good as it was.

# Why start with Project Compass when I can just start my own ME and have full control?
PC makes sure to abstract away enough to maximally ease the development, while keeping full flexibilty and control over it. In other words, PC will only give you a headstart and help you build a performant app as you rely on its programming model without taking away any control from you.

Some of the things that PC includes/does for you:
* Installing packages
* NPM dependencies (and hoisting them)
* UI classes and web libraries
* Configuration system
* Localization
* Logging and errors
* Desktop integration (custom protocols, file extensions, Windows tray, MacOS doc, single instancing...etc)
* Asynchronous programmation model (based on "tasks")
* User preferences
* File watching
And if you want to see anything added to PC, leave an issue or a PR!

As a bonus, PC is built on Electron, meaning you get to build your ME using web technologies and JavaScript. JavaScript is a great, easy language that is very fast compared to most other typeless languages, and the web APIs can make creating good performant UIs super easy. Even better, you get to use all those APIs on the same Chromium version, meaning you don't have to worry about support of any given API or backwards compatibility - if your code works once, it'll always work.
