# Aurora theme

This is a theme for Domoticz. It's a darker coloured theme, which can be used well in the evening. It adds a lot of features to Domoticz via javascript.

#If you would like to be the new maintainer of the theme, create an issue in the issue que.


## Installing

On your Raspberry Pi, go into the Domoticz directory via the terminal:

```
cd domoticz/www/styles
git clone https://github.com/flatsiedatsie/domoticz-aurora-theme.git aurora
sudo /etc/init.d/domoticz.sh restart
```

## Updating
```
cd domoticz/www/styles/aurora
git pull
```

## General features

### Show Version Number
This permanently shows the Domoticz version number, not just on mouse-over.

### Dashboard Move Sun
This moves the sun-up and sun-down times indicator to the footer.

### Center Popups
Sometimes items that pop-up, like colour selectors or thermostat setpoints, go off the screen. This forces them to be in the middle of the screen. Useful on smaller screens.


## Item grid changes

### Dashboard Vertical Columns
This feature will create vertical columns on your dashboard, one for each sensor type. BUT this feature only springs into action if you have enough horizontal space for the amount device-types that you have. So for 5 columns you need at least a 1300 pixels wide screen, for example. This feature works for both the normal and compact display option.

### Dashboard Merge temperature and weather
This merges these two categories into one "environment" category. Weather items are shown at the top. This is very useful if a vertical columns display is used.


## Item display changes

### Dashboard Highlights
This super-sizes the first three items for each category. You can use this to highlight some of your devices, or give their buttons a little more breathing room. This only works for the normal view, because the compact view is about saving space. This can be combined with Vertical Columns, but will create some strange behaviour if you have selected Variable Items Per Row, as it only enlarges the first three items of each category (for now).

### Dashboard Show Last Update
Enable this if you want items on the dashboard to also display the time they were last updated.

### Dashboard Merge Items With Same Name
This merges items that have the same name before a dash. It places all their data into the list of data outputs, and uses the parts after the dash as the name for those values. For example:

MiFlora plant 1 - Moisture<br/>
MiFlora plant 1 - Light level

..would be merged into one item with the new name "MiFlora", and it would display data called "Moisture" and "Light Level". The feature will only merge simple items with just one data value.


## Menu options

### Navigation Main Sidemenu
This moves the main menu to the left side of the screen. It works best for wide screens (about 980 pixels wide is my recommendation). It is automatically disabled for mobile phones.

### Settings Sidemenu
Instead of the tabs at the top of each settings page, you get a sidebar instead. It stays in place. This includes the 'save' button, so you always have easy access to that. Works well with both the menu at the top or the side menu.

## Extra options

### Dashboard Data Visualizations
This overlays a datavisualisation for certain items. They get complete charts for the past 24 hours. The data is pruned, so the vizualisation isn't very precise. But it's good enough. It also addssmall "day" / "month" buttons to change the visualised date range.

### Extra's and Animations
Adds some pretty details like barometer backgrounds and small animations on icons.
