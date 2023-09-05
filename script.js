function changeHTML(user, accreditation, phoneValue) {
    $('.firstname-name').html(`${user.firstname} ${user.name}`)
    $('.fonction').html(user.accreds[accreditation].position)
    $('.epfl-unit').html(user.accreds[accreditation].acronym)
    $('.office-place').html(user.accreds[accreditation].officeList[0] || 'Not defined')
    $('.office-place').attr('href', `https://plan.epfl.ch/?room==${user.accreds[accreditation].officeList[0]}` || `https://plan.epfl.ch`)
    $('.phone').html(user.accreds[accreditation].phoneList[phoneValue].replace(/^(\+\d{2})(\d{2})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5'))
    $('.phone').attr('href', `tel:${user.accreds[accreditation].phoneList[phoneValue]}`)
    $('.email').html(`${user.profile}@epfl.ch`)
    $('.email').attr('href', `mailto:${user.profile}@epfl.ch`)
    $('.people').html(`people/${user.profile}`)
    $('.people').attr('href', `https://people.epfl.ch/${user.sciper}`)
}

function generateAndChangeHTML(user, accreditation) {
    changeHTML(user, accreditation, 0)

    let phone = 0;
    if(user.accreds[accreditation].phoneList.length > 1) {
        $('.accred-selection-phone').removeClass('d-none');
        $('#select-accred-phone').empty();

        const accredPhoneSelect = document.getElementById('select-accred-phone')
        for (let i = 0; i < user.accreds[accreditation].phoneList.length; i++) {
            let phoneNumber = user.accreds[accreditation].phoneList[i];
            const option = document.createElement('option');
            const optionText = document.createTextNode(phoneNumber)

            option.appendChild(optionText)
            option.setAttribute('value', i)

            accredPhoneSelect.appendChild(option)
        }

        $("#select-accred-phone").change(function(){
            var phoneValue = $(this).find("option:selected").attr("value");

            changeHTML(user, accreditation, phoneValue)
            phone = phoneValue;
        });
    } else {
        $('.accred-selection-phone').addClass('d-none')
        phone = 0;
    }

    changeHTML(user, accreditation, phone)
}

function getPeopleBySciper(value) {
    $.get(`https://search-api.epfl.ch/api/ldap?q=${value}`, function( data ) {
        if(!data.length || data.length >= 2) {
            $('.alert-danger').html('No unique match for this query')
            $('.alert-danger').removeClass('d-none')
        } else {
            if(data[0].accreds.length > 1) {
                $('.accred-selection').removeClass('d-none')
                $('.accred-hr').removeClass('d-none')

                $('#select-accred').empty()

                generateAndChangeHTML(data[0], 0)

                const accredSelect = document.getElementById('select-accred')
                for (let i = 0; i < data[0].accreds.length; i++) {
                    let accred = data[0].accreds[i]
                    const option = document.createElement('option');
                    const optionText = document.createTextNode(accred.name)

                    option.appendChild(optionText)
                    option.setAttribute('value', i)

                    accredSelect.appendChild(option)
                }

                $("#select-accred").change(function(){
                    var optionValue = $(this).find("option:selected").attr("value");

                    generateAndChangeHTML(data[0], optionValue)
                });

                $('.alert-danger').addClass('d-none')

            } else {
                $('.accred-selection').addClass('d-none')
                $('.accred-hr').addClass('d-none')
                generateAndChangeHTML(data[0], 0)
                $('.alert-danger').addClass('d-none')
            }
        }
    });
}

async function apiCallAutocomplete() {
    var searchData = document.getElementById("sciper-input").value;

    $('#sciper-input').autocomplete({
        minLength: 3,
        source: function (request, response) {
            $.get(`https://search-api.epfl.ch/api/ldap?q=${searchData}`, function(data) {
                var stringList = data.map(function(e) {
                    return {
                        label: `${e.name} ${e.firstname} (${e.sciper})`,
                        value: e.sciper
                    }
                });

                response(stringList)
            })
         }
    });
}

const css = `
<style type="text/css">

    a, a:link, a:visited { color:#FF0000; text-decoration: underline; }


    a:link{color: #FF0000; text-decoration: underline !important}
    a:visited{color: #FF0000; text-decoration: underline !important}
    a:hover{color: #FF0000; text-decoration: underline !important}
    a:active{color: #FF0000; text-decoration: underline !important}

    /*outlook links visited state fix*/
    span.MsoHyperlink { mso-style-priority:99; color:inherit; }
    span.MsoHyperlinkFollowed { mso-style-priority:99; color:inherit; }

    a[x-apple-data-detectors] {
    color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
    }

    u + #body a {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
    }
    #MessageViewBody a {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
    }

    .blueLinks a {
        color:inherit !important;
        text-decoration: none !important;
    }

</style>
`

async function copyFormatted (html, button) {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');

    const langsJSON = await fetch('./langs.json')
        .then(response => response.json())
        .then(data => data)

    var container = document.createElement('div')
    container.innerHTML = css + html

    container.style.position = 'fixed'
    container.style.pointerEvents = 'none'
    container.style.opacity = 0

    var activeSheets = Array.prototype.slice.call(document.styleSheets)
    .filter(function (sheet) {
        return !sheet.disabled
    })
    document.body.appendChild(container)

    window.getSelection().removeAllRanges()
    var range = document.createRange()
    range.selectNode(container)
    window.getSelection().addRange(range)

    document.execCommand('copy')
    document.execCommand('copy')

    for (var i = 0; i < activeSheets.length; i++) activeSheets[i].disabled = false

    document.body.removeChild(container)

    button.textContent = langsJSON[langParam]['signature-copied']

    setTimeout(function(){
        button.textContent = langsJSON[langParam]['.copy-signature']
    }, 3000);
}

async function copyHTMLToClipboard(HTML, button) {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');

    const langsJSON = await fetch('./langs.json')
        .then(response => response.json())
        .then(data => data)

    await navigator.clipboard.writeText(css + HTML);

    button.textContent = langsJSON[langParam]['signature-copied']
    setTimeout(function(){
        button.textContent = langsJSON[langParam]['.copy-signature-html']
    }, 3000);
}

$( document ).ready(async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const sciperParam = urlParams.get('sciper');

    let localStorageObject = JSON.parse(localStorage.getItem('epfl-signatures'))
    if(!localStorageObject) localStorageObject = {lang: 'en'}
    localStorage.setItem('epfl-signatures', JSON.stringify(localStorageObject))
    const langParam = urlParams.get('lang') || localStorageObject.lang

    manageLanguage(`lang-${langParam}`)

    if(sciperParam) {
        $('#sciper-input').val(sciperParam)
        getPeopleBySciper($('#sciper-input').val())
    }

    $("#edit-button").on("click", function() {
        const url = new URL(window.location);
        const lang = url.searchParams.get('lang')
        if(!$('.copy-button').attr('disabled')) {
            if(lang == 'fr') {
                $("#edit-button").html('Sauvegarder')
            } else if(lang == 'en') {
                $("#edit-button").html('Save')
            }

            $("#edit-button").addClass('edit-on')
            $("#edit-button").removeClass('edit-off')

            $('.copy-button').attr('disabled', 'true')
            if(!$("#mobile-phone-input").val()) {
                $('#mobile-phone-data').css('display', '')
            } else {
                $('.mobile-phone-span').css('display', '')
            }

            if(!$("#website-displayed").val()) {
                $('#website-page-data').css('display', '')
            }

            $("#mobile-phone-data").html(`<br>Mobile : <input id="mobile-phone-input" type="phone" value="${$('#mobile-phone-value').html()}" />`)
            $("#website-page-data").html(`<br><span id="link-goto">${lang == 'fr' ? 'Lien :' : 'Link goto:'}</span> <input id="href-website" type="url" value="${$('#website-a').attr('href')}" /><br><span id="displayed-text">${lang == 'fr' ? 'Texte affiché :' : 'Displayed text:'}</span> <input id="website-displayed" type="url" value="${$('#website-value').html()}" />`)


        } else if($('.copy-button').attr('disabled')) {
            if(lang == 'fr') {
                $("#edit-button").html('Modifier')
            } else if(lang == 'en') {
                $("#edit-button").html('Edit')
            }

            $("#edit-button").removeClass('edit-on')
            $("#edit-button").addClass('edit-off')

            $('.copy-button').removeAttr('disabled')

            if(!$("#mobile-phone-input").val()) {
                $('.mobile-phone-span').css('display', 'none')
            } else {
                $('.mobile-phone-span').css('display', '')
            }

            if(!$("#website-displayed").val()) {
                $('#website-page-data').css('display', 'none')
            }

            $('.mobile-href').attr('href', `tel:${$("#mobile-phone-input").val()}`)
            $('.mobile-phone').html($("#mobile-phone-input").val())

            $("#mobile-phone-data").html(`<br>Mobile:
            <a class="mobile-href" href="tel:${$("#mobile-phone-input").val()}"
                style="color:#FF0000; text-decoration:underline;"><span id="mobile-phone-value" style="color:#FF0000;">${$("#mobile-phone-input").val()}</span></a>`)

            $("#website-page-data").html(`<br><a id="website-a" href="${$("#href-website").val()}" style="color:#FF0000; text-decoration:underline;"><span
            id="website-value" style="color:#FF0000;">${$("#website-displayed").val()}</span></a>`)
        }
    });
});

async function manageLanguage(langId) {
    const url = new URL(window.location);
    const langsJSON = await fetch('./langs.json')
        .then(response => response.json())
        .then(data => data)
    if(langId == 'lang-fr') {
        url.searchParams.set('lang', 'fr')
        window.history.pushState(null, '', url.toString())
        $('#lang-en').removeClass('text-primary')
        $('#lang-fr').addClass('text-primary')

        let localStorageObject = JSON.parse(localStorage.getItem('epfl-signatures'))
        localStorageObject.lang = 'fr'
        localStorage.setItem('epfl-signatures', JSON.stringify(localStorageObject))
    } else if(langId == 'lang-en') {
        url.searchParams.set('lang', 'en')
        window.history.pushState(null, '', url.toString())
        $('#lang-fr').removeClass('text-primary')
        $('#lang-en').addClass('text-primary')

        let localStorageObject = JSON.parse(localStorage.getItem('epfl-signatures'))
        localStorageObject.lang = 'en'
        localStorage.setItem('epfl-signatures', JSON.stringify(localStorageObject))
    }

    for (const [key, value] of Object.entries(langsJSON[url.searchParams.get('lang')])) {
        let wantedLang = url.searchParams.get('lang') == 'fr' ? 'en' : 'fr'
        if(key == '.firstname-name' || key == '.office-place-value' || key == '.epfl-unit') {
            if($(key).html() == langsJSON[wantedLang][key]) {
                $(`${key}`).html(value)
            }
        } else {
            $(`${key}`).html(value)
        }
    }
}
