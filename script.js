function changeHTML(user, accreditation, phoneValue, addressData) {
    const url = new URL(window.location)
    const langParam = url.searchParams.get('lang')

    $('.firstname-name').html(`${user.firstname} ${user.name}`)
    $('.fonction').html(user.accreds[accreditation].position)
    $('.epfl-unit').html(user.accreds[accreditation].acronym)
    if(!user.accreds[accreditation].officeList || !user.accreds[accreditation].officeList[0]) {
        $('.office-place-value').html(langParam == 'fr' ? 'Non défini' : 'Not defined')
        $('.office-place').attr('href', `https://plan.epfl.ch`)
    } else {
        $('.office-place-value').html(user.accreds[accreditation].officeList[0])
        $('.office-place').attr('href', `https://plan.epfl.ch/?room==${user.accreds[accreditation].officeList[0]}`)
    }
    if(user.accreds[accreditation].phoneList.length > 0) {
        $('.phone').html(user.accreds[accreditation].phoneList[phoneValue].replace(/^(\+\d{2})(\d{2})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5'))
        $('.phone').attr('href', `tel:${user.accreds[accreditation].phoneList[phoneValue]}`)
    } else {
        $('.phone').html('+41 21 693 11 11')
        $('.phone').attr('href', `tel:+41216931111`)
    }
    $('.email').html(`${user.profile}@epfl.ch`)
    $('.email').attr('href', `mailto:${user.profile}@epfl.ch`)
    $('.people').html(`people/${user.profile}`)
    $('.people').attr('href', `https://people.epfl.ch/${user.sciper}`)

    if(addressData.accreds[accreditation].fullAddress) {
        let fullAddressArray = addressData.accreds[accreditation].fullAddress.split('$ ')
        $('.postal-code').html(fullAddressArray.slice(-1)[0])
    } else {
        $('.postal-code').html('CH-1015 Lausanne')
    }
}

function generateAndChangeHTML(user, accreditation, addressData) {
    changeHTML(user, accreditation, 0, addressData)

    let phone = 0;
    if(user.accreds[accreditation].phoneList.length > 1) {
        $('.accred-selection-phone').css('display', '');
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

            changeHTML(user, accreditation, phoneValue, addressData)
            phone = phoneValue;
        });
    } else {
        $('.accred-selection-phone').css('display', 'none')
        phone = 0;
    }

    changeHTML(user, accreditation, phone, addressData)
}

async function getPeopleBySciper(value) {
    const url = new URL(window.location)
    const langParam = url.searchParams.get('lang')

    const langsJSON = await fetch('./langs.json')
        .then(response => response.json())
        .then(data => data)

    $.get(`https://search-api.epfl.ch/api/ldap?q=${value}&hl=${langParam}`, function( data ) {
        if(!data.length || data.length >= 2) {
            $('.danger-with-close-sciper').html(langsJSON[langParam]['.danger-with-close-sciper'])
            $('.alert-sciper').css('display', '')
        } else {
            url.searchParams.set('sciper', value)
            window.history.pushState(null, '', url.toString())
            $.get(`https://search-backend.epfl.ch/api/address?q=${value}`, function( addressData ) {
                if(data[0].accreds.length > 1) {
                    $('.accred-selection').css('display', '')
                    $('.accred-hr').css('display', '')
    
                    $('#select-accred').empty()
    
                    generateAndChangeHTML(data[0], 0, addressData)
    
                    const accredSelect = document.getElementById('select-accred')
                    for (let i = 0; i < data[0].accreds.length; i++) {
                        let accred = data[0].accreds[i]
                        const option = document.createElement('option');
                        const optionText = document.createTextNode(accred.name)
    
                        option.appendChild(optionText)
                        option.setAttribute('value', i)
    
                        accredSelect.appendChild(option)
                    }

                    $("#select-accred").off('change');
    
                    $("#select-accred").change(function(){
                        var optionValue = $(this).find("option:selected").attr("value");
    
                        generateAndChangeHTML(data[0], optionValue, addressData)
                    });
    
                    $('.alert-sciper').css('display', 'none')
    
                } else {
                    $('.accred-selection').css('display', 'none')
                    $('.accred-hr').css('display', 'none')
                    generateAndChangeHTML(data[0], 0, addressData)
                    $('.alert-sciper').css('display', 'none')
                }
            })
        }
    });
}

async function apiCallAutocomplete() {
    const url = new URL(window.location)
    var searchData = document.getElementById("sciper-input").value;

    url.searchParams.set('sciper', searchData)
    window.history.pushState(null, '', url.toString())

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
        },
        select: function (event, ui) {
            let sciper = ui.item.value
            getPeopleBySciper(sciper)
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

function changeSocialMedias() {
    const url = new URL(window.location);
    let socialMediasParam = url.searchParams.get('socialMedias')
    let signTypeParam = url.searchParams.get('signatureType')

    if(socialMediasParam == 'true') {
        if(signTypeParam == 'event') {
            $('.social-medias-event').css('display', '')
        } else {
            $('.social-medias').css('display', '')
        }
    } else if(socialMediasParam == 'false') {
        if(signTypeParam == 'event') {
            $('.social-medias-event').css('display', 'none')
        } else {
            $('.social-medias').css('display', 'none')
        }
    }
}

function clearInputValue(inputId) {
    $(`#${inputId}`).val('')
}

$( document ).ready(async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const sciperParam = urlParams.get('sciper');
    const socialMediasParam = urlParams.get('socialMedias')
    const imageURLParam = urlParams.get('imageURL')
    const imageHrefParam = urlParams.get('imageHref')
    const widthParam = urlParams.get('imgWidth')
    const heightParam = urlParams.get('imgHeight')

    const langsJSON = await fetch('./langs.json')
        .then(response => response.json())
        .then(data => data)

    let localStorageObject = JSON.parse(localStorage.getItem('epfl-signatures'))
    if(!localStorageObject) localStorageObject = {lang: 'en', signatureType: 'basic'}
    localStorage.setItem('epfl-signatures', JSON.stringify(localStorageObject))
    const langParam = urlParams.get('lang') || localStorageObject.lang
    const signTypeParam = urlParams.get('signatureType') || localStorageObject.signatureType

    await manageLanguage(`lang-${langParam}`)

    if(sciperParam) {
        $('#sciper-input').val(sciperParam)
        getPeopleBySciper($('#sciper-input').val())
    }

    if(socialMediasParam == 'true') {
        $('#social-medias-check').attr('checked', true)
        changeSocialMedias()
    }

    $('.signatures-radios').click(function() {
        const updatedUrlParams = new URLSearchParams(window.location.search);
        manageSignType($(this).attr('id'), updatedUrlParams.get('imageURL'), updatedUrlParams.get('imageHref'))
    })

    const url = new URL(window.location);
    $('#event-image').resizable({
        stop: function(e,ui) {
            $('#event-image').attr('width', ui.size.width)
            $('#event-image').attr('height', ui.size.height)

            url.searchParams.set('imgWidth', ui.size.width)
            url.searchParams.set('imgHeight', ui.size.height)

            window.history.pushState(null, '', url.toString())
        }
    })

    $(`#${signTypeParam}`).attr('checked', true)
    manageSignType($(`#${signTypeParam}`).attr('id'), imageURLParam, imageHrefParam)
    if(widthParam) {
        $('#event-image').attr('width', widthParam)
        $('#event-image').css('width', `${widthParam}px`)
        $('.ui-wrapper').css('width', `${widthParam}px`)
    }
    if(heightParam) {
        $('#event-image').attr('height', heightParam)
        $('#event-image').css('height', `${heightParam}px`)
        $('.ui-wrapper').css('height', `${heightParam}px`)
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

            $('#free-area-xl-td').css('display', '')
            if(signTypeParam == 'event') {
                $('#free-area-xl-td-event').css('display', '')
            }

            $('.copy-button').attr('disabled', 'true')
            if(!$("#mobile-phone-input").val()) {
                $('#mobile-phone-data').css('display', '')
            } else {
                $('.mobile-phone-span').css('display', '')
            }

            if(!$("#website-displayed").val()) {
                $('#website-page-data').css('display', '')
            }

            $('#office-place-span').html(`<input id="office-place-input" value="${$('#office-place-check-value').html()}" />`)

            $("#mobile-phone-data").html(`<br>Mobile : <input id="mobile-phone-input" type="phone" value="${$('#mobile-phone-value').html()}" /> <a class="fa-solid fa-trash" href="javascript:clearInputValue('mobile-phone-input')"></a>`)
            $("#website-page-data").html(`<br><span id="link-goto">${lang == 'fr' ? 'Lien :' : 'Link goto:'}</span> <input id="href-website" type="url" value="${$('#website-a').attr('href')}" /><br>
            <span id="displayed-text">${lang == 'fr' ? 'Texte affiché :' : 'Displayed text:'}</span> <input id="website-displayed" type="url" value="${$('#website-value').html()}" /> 
            <a class="fa-solid fa-trash" href="javascript:clearInputValue('website-displayed'); clearInputValue('href-website')"></a>`)

            $('#free-area-xl').html(`<textarea id="tiny">${$('#free-area-xl').html() || langsJSON[lang]['free-text-area']}</textarea><br>`)
            if(signTypeParam == 'event') {
                $('#free-area-xl-event').html(`<textarea id="tiny-event">${$('#free-area-xl-event').html() || langsJSON[lang]['free-text-area']}</textarea><br>`)
                $('textarea#tiny-event').tinymce({
                    height: 200,
                    menubar: false,
                    plugins: 'link',
                    toolbar: 'undo redo | bold italic underline | link'
                });
            }

            $('textarea#tiny').tinymce({
                height: 200,
                menubar: false,
                toolbar: 'undo redo | bold italic underline'
            });

        } else if($('.copy-button').attr('disabled')) {
            if(lang == 'fr') {
                $("#edit-button").html('Modifier')
            } else if(lang == 'en') {
                $("#edit-button").html('Edit')
            }

            $("#edit-button").removeClass('edit-on')
            $("#edit-button").addClass('edit-off')

            $('#free-area-xl').html(tinymce.get('tiny').getContent().replace('<br>', '') == langsJSON[lang]['free-text-area'] ? '' : tinymce.get('tiny').getContent())

            if(!$('#free-area-xl').html()) {
                $('#free-area-xl-td').css('display', 'none')
            } else {
                $('#free-area-xl-td').css('display', '')
            }

            if(signTypeParam == 'event') {
                $('#free-area-xl-event').html(tinymce.get('tiny-event').getContent().replace('<br>', '') == langsJSON[lang]['free-text-area'] ? '' : tinymce.get('tiny-event').getContent())
                
                if(!$('#free-area-xl-event').html()) {
                    $('#free-area-xl-td-event').css('display', 'none')
                } else {
                    $('#free-area-xl-td-event').css('display', '')
                }
            }

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

            $('.office-place-value').html($('#office-place-input').val())
            $('.office-place').attr('href', `https://plan.epfl.ch/?room==${$('#office-place-input').val()}`)
            $('#office-place-span').html(`<a class="office-place" href="https://plan.epfl.ch/?room==${$('#office-place-input').val()}"
            style="color:#FF0000; text-decoration:underline;"><span
                class="office-place-value" id="office-place-check-value" style="color:#FF0000;">${$('#office-place-input').val()}</span></a>`)

            $("#mobile-phone-data").html(`<br>Mobile:
            <a class="mobile-href" href="tel:${$("#mobile-phone-input").val()}"
                style="color:#FF0000; text-decoration:underline;"><span id="mobile-phone-value" style="color:#FF0000;">${$("#mobile-phone-input").val()}</span></a>`)

            $("#website-page-data").html(`<br><a id="website-a" href="${$("#href-website").val()}" style="color:#FF0000; text-decoration:underline;"><span
            id="website-value" style="color:#FF0000;">${$("#website-displayed").val()}</span></a>`)
        }
    });

    $('#social-medias-check').change(
        function(){
            const url = new URL(window.location);
            if (this.checked) {
                url.searchParams.set('socialMedias', true)
            } else {
                url.searchParams.set('socialMedias', false)
            }

            window.history.pushState(null, '', url.toString())
            changeSocialMedias()
        }
    );
});

function manageImageHref(url) {
    const urlQuery = new URL(window.location);
    urlQuery.searchParams.set('imageHref', url)
    window.history.pushState(null, '', urlQuery.toString())

    if(!url) {
        $('#event-image-a').removeAttr('href')
    } else {
        $('#event-image-a').attr('href', url)
    }
}

async function manageImageURL(url) {
    const urlQuery = new URL(window.location);
    urlQuery.searchParams.set('imageURL', url)
    window.history.pushState(null, '', urlQuery.toString())

    const langsJSON = await fetch('./langs.json')
        .then(response => response.json())
        .then(data => data)

    const langParam = urlQuery.searchParams.get('lang');

    new Promise((resolve) => {
        const img = new Image();
    
        img.src = url;
        img.onload = () => {
            $('#event-image').attr('src', url)
            $('.alert-img').css('display', 'none')

            const { hostname } = new  URL(url)
            if(!hostname.includes('epfl.ch')) {
                $('.alert-warning').css('display', '')
                $('.warning-with-close').html(langsJSON[langParam]['.warning-with-close'])
            } else {
                $('.alert-warning').css('display', 'none')
            }
        }
        img.onerror = () => {
            if(url) {
                $('.danger-with-close-img').html(langsJSON[langParam]['.danger-with-close-img'])
                $('.alert-img').css('display', '')
            } else {
                $('.alert-img').css('display', 'none')
            }
            $('#event-image').attr('src', 'favicons/android-chrome-512x512.png')
            $('.alert-warning').css('display', 'none')
        }
      });
}

async function manageSignType(signType, imageURL, imageHref) {
    const url = new URL(window.location);
    let socialMediasParam = url.searchParams.get('socialMedias')
    if(signType == 'event') {
        $('.sign').addClass('d-flex align-items-center')
        $('.event-sign-img').css('display', '')
        $('#event-img').css('display', '')
        $('.sign-l, .sign-m, .hide-if-event').css('display', 'none')
        $('.epfl-sign-logo').css('display', 'none')
        $('.padding-50-if-event').css('padding-left', '40px')
        if(socialMediasParam == 'true') {
            $('.social-medias-event').css('display', '')
            $('.social-medias').css('display', 'none')
        }

        if(imageURL !== null) {
            $('#event-img-src-input').val(imageURL)
            manageImageURL(imageURL)
        }

        if(imageHref !== null) {
            $('#event-img-a-input').val(imageHref)
            manageImageHref(imageHref)
        }

        $('.sign-xl').css('gap', '5vw')
        $('.sign-xl').removeClass('w-500')
        $('.sign-xl').addClass('w-750')
    } else if(signType == 'basic') {
        $('.sign').removeClass('d-flex align-items-center')
        $('.event-sign-img').css('display', 'none')
        $('#event-img').css('display', 'none')
        $('.alert-danger').css('display', 'none')
        $('.sign-l, .sign-m, .hide-if-event').css('display', '')
        $('.epfl-sign-logo').css('display', '')
        $('.padding-50-if-event').css('padding-left', '')
        if(socialMediasParam == 'true') {
            $('.social-medias').css('display', '')
            $('.social-medias-event').css('display', 'none')
        }

        $('.sign-xl').css('gap', '20vw')
        $('.sign-xl').addClass('w-500')
        $('.sign-xl').removeClass('w-750')
    }

    url.searchParams.set('signatureType', signType)
    window.history.pushState(null, '', url.toString())

    let localStorageObject = JSON.parse(localStorage.getItem('epfl-signatures'))
    localStorageObject.signatureType = signType
    localStorage.setItem('epfl-signatures', JSON.stringify(localStorageObject))
}

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
        if(key == '.firstname-name' || key == '.office-place-value' || key == '.epfl-unit' || key == '#big-sign-email' || key == '#people-link' || key == '#website-value') {
            if($(key).html() == langsJSON[wantedLang][key]) {
                $(`${key}`).html(value)
            }
        } else {
            $(`${key}`).html(value)
        }
    }

    sciperParam = url.searchParams.get('sciper')
    if(sciperParam) {
        getPeopleBySciper(url.searchParams.get('sciper'))
    }
}
