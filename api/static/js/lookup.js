// MFASupport Elements
var DOCUMENATION = '#documentation';
var SMS = '#sms';
var PHONE_CALL = '#phone_call';
var EMAIL = '#email';
var HARDWARE_TOKEN = '#hardware_token';
var SOFTWARE_IMPLEMENTATION = '#software_implementation';

// EncryptionSupport Elements
var SHA_STATUS = '#sha_status';

// Organization Elements
var NAME = '#site-name'
var CATEGORY = '#category';
var WEBSITE = '#website';
var LOGO = '#logo';

var currentSite;

// Get the active site in the user's open browser window
// and use it to put together the extension.
$(function() {
    $('#lookup-btn').on('click', function() {
        // get the site from the user and clean it a little
        currentSite = $('#lookup-site').val();
        currentSite = sanitizeString(currentSite);
        resetLookup();
        if (currentSite.length <= 0) {
            alert('Please enter a valid site.');
        } else {
            createSiteReport();
        }
    });

    $('#lookup-reset-btn').on('click', function() {
        resetLookup();
    });
});

// look up the given site and create a report for it
function createSiteReport() {
    $('#site-report').removeClass('hidden');

    // Query the API for this site. If there is data, display the stats.
    // If there isn't data for the site, show the "add site" button
    var request = $.ajax({
      url: 'http://localhost:8000/api/organization/',
      type: 'GET',
      data: {search : currentSite.replace('www.', '')},
      dataType: 'json'
    });

    request.done(function(data) {

        // If there is data on the organization, fill in the fields of the
        // popup with the appropriate metrics
        if(data.length) {
            // Keep track of how many saftey metrics they pass
            var metricScore = 0;

            // Access the organization object returned from the API
            var organization = data[0];
            var mfaSupport = organization.mfa_support;
            var encryptionSupport = organization.encryption_support;

            // Pair the div ids with their site data
            divToDataMap = [
                [SMS, mfaSupport.sms],
                [PHONE_CALL, mfaSupport.phone_call],
                [EMAIL, mfaSupport.email],
                [HARDWARE_TOKEN, mfaSupport.hardware_token],
                [SOFTWARE_IMPLEMENTATION, mfaSupport.software_implementation],
                [SHA_STATUS, encryptionSupport.sha_status]
            ];

            // Iterate through div-to-data map and generate each report item
            var arrayLength = divToDataMap.length;
            for(var i = 0; i < arrayLength; i++) {
                var divName = divToDataMap[i][0];
                var dataItem = divToDataMap[i][1];

                // If affirmative, add the check mark and increase metricScore
                if(dataItem) {
                    $(divName).find('.support').addClass('fa fa-check fa-2x');
                    if(divName != SHA_STATUS) metricScore++;
                } else {
                    $(divName).find('.support').addClass('fa fa-ban fa-2x');
                }
            }

            // Fill in the site information
            $(NAME).html(organization.name);
            $(LOGO).attr('src', organization.logo);

            // Show the header and success div, and hide the pre-loader
            $('#site-info-header').removeClass('hidden');
            $('#success').removeClass('hidden');
            $('#loading').addClass('hidden');

            // If they don't offer any MFA, add the 'tweet at them' button
            if(metricScore == 0 && organization.twitter_handle != ''){
                var tweetText = 'https://twitter.com/share?url=' + 'http%3A%2F%2Ftwofactorauth.org&amp;text=Security+is+' +
                'important%2C+%40' + organization.twitter_handle +  '.+We%27d+like+it+if+you+supported+multi-factor+auth.&amp;' + 'hashtags=SupportTwoFactorAuth';
                // insert tweet text and show the twitter button
                $('#no-mfa a').attr('href', tweetText);
                $('#no-mfa').removeClass('hidden');
            }

        // If we do not have this organization, then show the
        // div to allow user to add the org to our list
        } else {
            var url = currentSite;
            // remove the protocol, then remove trailing slashes
            url = url.replace(/.*?:\/\//g, "");
            url = url.replace(/\/$/, '')

            // Use the URL as the org's name in the html header
            $(NAME).html(url);

            // Get the site's favicon to use as the logo
            var favicon = 'http://www.google.com/s2/favicons?domain=' + currentSite;
            $(LOGO).attr('src', favicon);

            // Show the header and no-success div, and hide the pre-loader
            // $('#add-site').html('<i class="fa fa-plus fa-lg"></i> add this site');

            $('#no-data').removeClass('hidden');
            $('#site-info-header').removeClass('hidden');
            $('#no-success').removeClass('hidden');
            $('#loading').addClass('hidden');
        }
    });
}

// handle button clicks for 'add site' button
// and use it to put together the extension.
$(function() {
    $('#add-site').on('click', addSite);
});

// if the site does not exist, allow the user to submit an "add site" request
function addSite() {
    // replace button text with spinner
    document.getElementById('add-site').style.pointerEvents = 'none';
    $('#add-site').html('<i class="fa fa-cog fa-spin fa-lg"></i>');

    // send a new "add site" request
    var request = $.ajax({
        url: 'http://localhost:8000/add_site/',
        type: 'POST',
        data: {'site': currentSite},
        success: function(resp) {
            $('#no-data').addClass('hidden');
            $('#submitted').removeClass('hidden');
        }
    });
}

// reset the lookup functionality after a search
function resetLookup() {
    $('#lookup-site').val('');

    $('#site-report').addClass('hidden');
    $('#site-info-header').addClass('hidden');
    $('#success').addClass('hidden');
    $('#no-success').addClass('hidden');
    $('#submitted').addClass('hidden');
    $('#no-mfa').addClass('hidden');
}

// Some basic input cleaning client-side. The heavy sanitization
// will happen server side if they attempt to add a site.
// http://stackoverflow.com/questions/23187013/is-there-a-better-way-to-sanitize-input-with-javascript
function sanitizeString(str){
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
    return str.trim();
}
