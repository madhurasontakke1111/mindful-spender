# mindful-spender
Mindful Spender is a Chrome extension that promotes mindful online shopping by showing a short pop-up on shopping websites like Amazon, encouraging users to rethink impulsive purchases and make smarter financial decisions.
MINDFUL SPENDER — Chrome Extension
====================================

INSTALLATION
------------
1. Open Chrome and go to: chrome://extensions/
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the "mindful-spender" folder
5. The extension is now installed!

SETUP
-----
Click the 🌿 icon in your Chrome toolbar to open Settings.
Enter your hourly take-home wage and click Save.

HOW IT WORKS
------------
• When you visit a cart or checkout page, a calm green overlay appears
• A 60-second timer counts down while you reflect on your purchase
• Your work-hours cost is calculated automatically from the cart total
• The "Proceed" button only appears after the full 60 seconds have passed

REFLECTION PROMPTS
------------------
During the pause, the overlay shows rotating mindful questions:
  - "Do I really need this, or do I just want it right now?"
  - "Will this matter to me in 6 months?"
  - "Am I buying this out of stress or genuine need?"
  ... and more

SUPPORTED SITES
---------------
Works on any site whose URL contains: cart, checkout, basket, order,
payment, buy-now, purchase, proceed-to-pay, confirm-order

Also detects checkout pages by looking for common checkout UI elements
on sites that use single-page app routing.

PRIVACY
-------
This extension stores ONLY your hourly wage locally using Chrome's
sync storage. No data is ever sent to any external server.
