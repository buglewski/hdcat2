import React, { useEffect } from 'react';


const SETTINGS = {}

export const isClaimEmpty = (claim) => {
    if (!claim.cathegories) return true
    for (let c of claim?.cathegories){
        if (!c) {
            console.log(claim)
            return true;
        }
    }
    if (!claim?.claimer_id) return true
    return false
}

export const isEmpty = (obj) => {
    for (let key in obj){
        if (obj[key]) return false 
    }
    return true
}

export const codeToStatus = (code) => {
    if (code == 1) return "Удовлетворено"
    if (code == 0) return "На рассмотрении"
    if (code == -1) return "Отказано"
    return "Неизвестно"
}

export const getPersonByIdInFP = (family_persons, id) => {

    if  (!family_persons  || !(typeof family_persons[Symbol.iterator] === 'function')) return null;
    for (let family_person of family_persons){
        if (family_person.person.id == id) return family_person.person
    }
    return null
}

export const getClaimById = (claims, id) => {
    for (let claim of claims){
        if (claim.id == id) return claim
    }
    return {}
}

export const getDocumentById = (documents, id) => {
    for (let doc of documents){
        if (doc.id == id) return doc
    }
    return {}
}

export const transformInputClaim = (claim) =>{
    if (claim.attributes == undefined) return
    claim.cathegories = claim.attributes.split("$")
}

export const transformOutputClaim = (claim) =>{
    let i = 0;
    claim.attributes = ''
    for (let i=0; i < SETTINGS.claims[claim.typename].number_of_cathegories; i++){
        claim.attributes += '$' + claim['cathegory_'+i]
    }
}

export const PersonFullName = function(person){
    if (person.secondname)
        return person.lastname + ' ' + person.firstname + ' ' + person.secondname
    else
        return person.lastname + ' ' + person.firstname
}

export const HouseFullAddress = function(house){
    let ans = ''
    if (house?.region) ans = ans + house.region + ', ';
    if (house?.city) ans = ans + house.city + ', ';
    if (house?.prefix) ans = ans + house.prefix + ' ';
    if (house?.street) ans = ans + house.street + ' ';
    if (house?.house) ans = ans + house.house;
    if (house?.flat) ans = ans + '-' + house.flat;
    if (ans === '') ans = "Не найден"
    return ans;
}

export const UseLoading = (callback) => {
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState(null)

    const call = async () => {
        setIsLoading(true)
        try{
            await callback();
        } catch (error){
            setError(error)
        }
        setIsLoading(false)
    }

    return [call, isLoading, error]
}
