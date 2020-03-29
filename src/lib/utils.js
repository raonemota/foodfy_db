module.exports = {
    age: function(timestamp){

        const today = new Date()
        const birthDate = new Date(timestamp)
    
        let age = today.getFullYear() - birthDate.getFullYear()
    
        const month = today.getMonth() - birthDate.getMonth()
        
        
        birthDate.getDate()
    
        if( month < 0 || month == 0 && today.getDate() < birthDate.getDate() ){
            age = age - 1
        }
        
        return age
    
    },

    date: function(timestamp){
        const date = new Date(timestamp)
        const year = date.getUTCFullYear()
        const month = `0${date.getUTCMonth() + 1}`.slice(-2) 
        const day = `0${date.getUTCDate()}`.slice(-2)

        return {
            iso: `${day}/${month}/${year}`,
            birthDay: `${day}/${month}`,
            format: `${year}-${month}-${day}`
        }

    },

    typeBlood: function(blood){
        switch (blood) {
            case 'A1':
                return 'A+'
                break;
            case 'A0':
                return 'A-'
                break;
            case 'B1':
                return 'B+'
                break;
            case 'B0':
                return 'B-'
                break;
            case 'AB1':
                return 'AB+'
                break;
            case 'AB0':
                return 'AB-'
                break;
            case 'O1':
                return 'O+'
                break;
            case 'O0':
                return 'O-'
                break;
        }        
    }
}