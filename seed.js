var faker = require('faker/locale/pt_BR')

const { hash } = require('bcryptjs')

const User = require('./src/app/models/Users')
const Chef = require('./src/app/models/Chefs')
const Recipe = require('./src/app/models/Recipes')
const File = require('./src/app/models/File')

const { date } = require('./src/lib/utils')

let usersIds = []
let chefsIds = []

totalUsers = 3
totalChefs = 4
totalRecipes = 5
totalIngredients = 15
totalSteps = 15

async function createUsers() {
    const users = []
    const password = await hash('1234', 8)

    usersIds = await User.create({
        name: 'admin',
        email: 'admin@foodfy.com.br',
        password: await hash('1234', 8),
        is_admin: 1
    })

    while (users.length < totalUsers) {
        users.push({
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password,
            is_admin: Math.floor(Math.random()*2)
        })
    }

    const usersPromise = users.map(user => User.create(user))
    usersIds = await Promise.all(usersPromise)

}

async function createChefs() {
    const chefs = []

    while (chefs.length < totalChefs) {
        chefs.push({
            name: faker.name.firstName(),
            avatar_url: faker.image.avatar()
        })
    }

    const chefsPromise = chefs.map(chef => Chef.create(chef))
    chefsIds = await Promise.all(chefsPromise)
}

async function createRecipes(){
    await Recipe.create({
        title: 'Burguer de carneiro',
        additional_info: 'preaqueça a chapa, frigideira ou grelha por 10 minutos antes de levar os hambúrgueres.',
        created_at: date(Date.now()).format,
        id_chef: chefsIds[Math.floor(Math.random() * totalChefs)],
        id_user: 1
    })

    await Recipe.create({
        title: 'Buffalo Wings',
        additional_info: 'Passe o frango frito no molho e leve para assar em forno pré-aquecido a 200°, até ficar bem assado e sequinho.',
        created_at: date(Date.now()).format,
        id_chef: chefsIds[Math.floor(Math.random() * totalChefs)],
        id_user: 1
    })

    await Recipe.create({
        title: 'Chocolate em barra',
        additional_info: 'Aguarde esfriar para colocar na caixa',
        created_at: date(Date.now()).format,
        id_chef: chefsIds[Math.floor(Math.random() * totalChefs)],
        id_user: 1
    })

}

async function createIngredients(){
    await Recipe.createIngred('3 kg de carne moída de carneiro', 1)
    await Recipe.createIngred('300 g de bacon moído', 1)
    await Recipe.createIngred('1 Ovo', 1)
    await Recipe.createIngred('3 colheres (sopa) de farinha de trigo', 1)
    await Recipe.createIngred('30 ml de água gelada', 1)

    await Recipe.createIngred('1 kg de asas/sobreasas de frango', 2)
    await Recipe.createIngred('Sal para temperar', 2)
    await Recipe.createIngred('Alho para temperar', 2)
    await Recipe.createIngred('Farinha de trigo', 2)
    await Recipe.createIngred('Óleo para fritar', 2)

    await Recipe.createIngred('2 xícaras de farinha de trigo', 3)
    await Recipe.createIngred('2 xícaras de açúcar', 3)
    await Recipe.createIngred('1 xícara de leite', 3)
    await Recipe.createIngred('6 colheres (sopa) de chocolate em pó', 3)
    await Recipe.createIngred('1 colher (sopa) de fermento em pó', 3)
    
}

async function createSteps(){
    await Recipe.createSteps('Misture todos os ingredientes muito bem e amasse para que fique tudo muito bem misturado.', 1)
    await Recipe.createSteps('Faça porções de 90 g a 100 g.', 1)
    await Recipe.createSteps('Forre um plástico molhado em uma bancada e modele os hambúrgueres utilizando um aro como base.', 1)
    await Recipe.createSteps('Faça um de cada vez e retire o aro logo em seguida.', 1)
    await Recipe.createSteps('Forre uma assadeira de metal com plástico, coloque os hambúrgueres e intercale camadas de carne e plásticos (sem apertar).', 1)
    await Recipe.createSteps('Faça no máximo 4 camadas por forma e leve para congelar.', 1)

    await Recipe.createSteps('Limpe bem o frango sem retirar a pele, separe a asa da sobreasa (coxinha da asa).', 2)
    await Recipe.createSteps('Também pode ser feito só com a asa ou só com a coxinha da asa.', 2)
    await Recipe.createSteps('Tempere com um pouco de sal e alho.', 2)
    await Recipe.createSteps('Passe o frango na farinha de trigo e doure em óleo bem quente, não é necessário deixar muito tempo.', 2)
    await Recipe.createSteps('Escorra no papel toalha.', 2)
    
    await Recipe.createSteps('Em uma batedeira, bata as claras em neve, acrescente as gemas, o açúcar e bata novamente.', 3)
    await Recipe.createSteps('Adicione a farinha, o chocolate em pó, o fermento, o leite e bata por mais alguns minutos.', 3)
    await Recipe.createSteps('Despeje a massa em uma forma untada e leve para assar em forno médio (180° C), preaquecido, por 40 minutos.', 3)
    await Recipe.createSteps('Em uma panela, leve a fogo médio o chocolate em pó, a manteiga e o leite, deixe até ferver.', 3)
    await Recipe.createSteps('Despeje quente sobre o bolo já assado.', 3)

}

async function createFiles(){
    await File.create({filename:'burger.png',path:'public\\images\\burger.png', id_recipe: 1})
    await File.create({filename:'asinhas.png',path:'public\\images\\asinhas.png', id_recipe: 2})
    await File.create({filename:'doce.png',path:'public\\images\\doce.png', id_recipe: 3})
}


async function init(){
    await createUsers()
    await createChefs()
    await createRecipes()
    await createIngredients()
    await createSteps()
    await createFiles()
}

init()




