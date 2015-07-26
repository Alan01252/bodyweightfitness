var bwf = bwf || {};
bwf.settings = [{
    "name": "Enable sounds",
    "key": "enableSounds",
    "value": true,
    "type": "checkbox"
},
    {
        "name": "Allowed orientation",
        "key": "lockOrientation",
        "value": "both",
        "allowedValues": [
            {'value': "both", 'name': 'both'},
            {'value': "portrait", 'name': 'portrait'},
            {'value': "landscape", 'name': 'landscape'}
        ],
        "type": "select"
    }
];
