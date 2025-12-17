// Banco de dados de culturas com extração e exportação por tonelada
// Inclui macronutrientes e micronutrientes conforme manual técnico

const culturasDB = {
    soja: {
        nome: 'Soja',
        // Macronutrientes (kg/ton)
        p2o5: 15.6,
        k2o: 58.1,
        n: 80.0,
        ca: 8.0,
        mg: 4.0,
        s: 3.0,
        // Micronutrientes (g/ton)
        boro: 82.0,
        cobre: 19.8,
        manganes: 198.0,
        zinco: 75.0
    },
    milho: {
        nome: 'Milho',
        // Macronutrientes (kg/ton) - Valores atualizados conforme especificação
        p2o5: 5.8,
        k2o: 18.8,
        n: 26.1,
        ca: 2.0,
        mg: 2.0,
        s: 2.0,
        // Micronutrientes (g/ton)
        boro: 12.3,
        cobre: 15.2,
        manganes: 54.8,
        zinco: 56.2
    },
    algodao: {
        nome: 'Algodão',
        // Macronutrientes (kg/ton)
        p2o5: 9.0,
        k2o: 82.0,
        n: 45.0,
        ca: 15.0,
        mg: 8.0,
        s: 5.0,
        // Micronutrientes (g/ton) - valores padrão (não especificados no manual)
        boro: 0,
        cobre: 0,
        manganes: 0,
        zinco: 0
    },
    feijao: {
        nome: 'Feijão',
        // Macronutrientes (kg/ton)
        p2o5: 3.6,
        k2o: 16.4,
        n: 40.0,
        ca: 3.0,
        mg: 2.0,
        s: 2.0,
        // Micronutrientes (g/ton) - valores padrão (não especificados no manual)
        boro: 0,
        cobre: 0,
        manganes: 0,
        zinco: 0
    },
    sorgo: {
        nome: 'Sorgo',
        // Macronutrientes (kg/ton) - valores técnicos estimados
        p2o5: 7.5,
        k2o: 17.0,
        n: 23.5,
        ca: 2.0,
        mg: 2.0,
        s: 2.0,
        // Micronutrientes (g/ton)
        boro: 0,
        cobre: 0,
        manganes: 0,
        zinco: 0
    }
};

// Função para obter dados de uma cultura
function getCulturaData(cultura) {
    return culturasDB[cultura] || null;
}

// Função para listar todas as culturas
function getAllCulturas() {
    return Object.keys(culturasDB).map(key => ({
        id: key,
        ...culturasDB[key]
    }));
}

