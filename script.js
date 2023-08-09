function getPeopleBySciper(sciper) {
    console.log(sciper)
    $.get(`https://search-api.epfl.ch/api/ldap?q=${sciper}`, function( data ) {
        console.log(data)
        if(data.length) {
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
        } else {
            alert('Sciper is invalid')
        }
    });
}