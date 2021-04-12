const Axios = require('axios')
const axios = require('axios').default;
const fs = require('fs')

const JSESSIONID = 'CgEHChrqYHPO4QJeP2YIfkhMun6tEuDB17EA'

function getPersons(longNumber) {
    return new Promise((resolve, reject) => {
        axios({
            method: 'get',
            params: {
                method: 'getListData',
                columnModel: "name,position.name",
                contacts_longNumber: longNumber,
                rows: 10,
                page: 1,
                sidx: "adminOrgUnit.sortCode,position.index,position.number,indexOf,id",
                componentID: "personList",
                uipk: "com.kingdee.eas.basedata.person.app.Person.alllist",
            },
            url: "http://10.1.7.10:8068/shr/dynamic.do",
            headers: {
                "Cookie": `JSESSIONID=${JSESSIONID}; EASSESSIONID=0; NAPRoutID=-2131442180`,
            },
        }).then((value) => {
            resolve(value.data)
        })

    })
}

function getTreeData(nodeId) {
    return new Promise((resolve, reject) => {
        axios.get(`http://10.1.7.10:8068/shr/dynamic.do?method=getTreeData&uipk=com.kingdee.eas.basedata.person.app.Person.dynamicList&nodeId=${nodeId}`, {
            headers: {
                "Cookie": `JSESSIONID=${JSESSIONID}; EASSESSIONID=0; NAPRoutID=-2131442180`
            }
        }).then((value) => {
            resolve(value.data)
        })

    })
}

const res = {}

let load = async function () {
    const ones = await getTreeData('00000000-0000-0000-0000-000000000000CCE7AED4')
    for (let one of ones) {
        const persons = await getPersons(one.longNumber)
        res[one.name] = {
            persons:[persons.rows[0], persons.rows[1]]
        }

        let twos = await getTreeData(one.id)
        if (!twos || !twos.length) {
            console.log(one.name, ' ', one.id, ' 2222nullllll')
            continue;
        }
        for (let two of twos) {
            const persons = await getPersons(two.longNumber)
            res[one.name][two.name] = {
                persons:[persons.rows[0], persons.rows[1]]
            }
            let threes = await getTreeData(two.id)
            if (!threes || !threes.length) {
                console.log(two.name, ' ', two.id, ' 333333nullllll')
                continue;
            }
            for (let three of threes) {
                const persons = await getPersons(three.longNumber)
                res[one.name][two.name][three.name] = {
                    persons:[persons.rows[0], persons.rows[1]]
                }
            }
        }
    }
    console.log(res)
    fs.writeFileSync('./res.json', JSON.stringify(res))
}
load()