function getPeopleBySciper(value) {
    $.get(`https://search-api.epfl.ch/api/ldap?q=${value}`, function( data ) {
        if(!data.length || data.length >= 2) {
            $('.alert-danger').html('Sciper is invalid')
            $('.alert-danger').removeClass('d-none')
        } else {
            $('.firstname-name').html(`${data[0].firstname} ${data[0].name}`)
            $('.fonction').html(data[0].accreds[0].position)
            $('.epfl-unit').html(data[0].accreds[0].acronym)
            $('.office-place').html(data[0].accreds[0].officeList[0] || `Not defined`)
            $('.phone').html(data[0].accreds[0].phoneList[0])
            $('.phone').attr('href', `tel:${data[0].accreds[0].phoneList[0]}`)
            $('.email').html(`${data[0].profile}@epfl.ch`)
            $('.email').attr('href', `mailto:${data[0].profile}@epfl.ch`)
            $('.people').html(`people/${data[0].profile}`)
            $('.people').attr('href', `https://people.epfl.ch/${data[0].sciper}`)
            $('.alert-danger').addClass('d-none')
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