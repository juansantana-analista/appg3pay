       // Benefit descriptions
        const benefitDetails = {
            imunidade: {
                title: "Fortalece a Imunidade",
                description: "A Vitamina C presente neste combo é essencial para fortalecer o sistema imunológico. Ela auxilia na produção de glóbulos brancos, que são fundamentais para combater infecções. Estudos mostram que a suplementação regular de Vitamina C pode reduzir a duração e a gravidade de resfriados comuns, além de acelerar o processo de recuperação. Nossa fórmula de alta absorção garante que seu corpo utilize ao máximo os benefícios deste nutriente essencial."
            },
            pele: {
                title: "Benefícios para Pele",
                description: "O Colágeno Hidrolisado presente no combo é um aliado poderoso para a saúde da pele. Ele ajuda a melhorar a elasticidade e hidratação da pele, reduzindo o aparecimento de rugas e linhas finas. O colágeno também fortalece unhas e cabelos, proporcionando mais brilho e resistência. Nossa fórmula de colágeno tipo I e III foi desenvolvida especificamente para maximizar os benefícios estéticos, com resultados visíveis após 30 dias de uso contínuo."
            },
            cardio: {
                title: "Saúde Cardiovascular",
                description: "O Ômega 3 presente neste combo é rico em EPA e DHA, ácidos graxos essenciais que contribuem significativamente para a saúde do coração. Eles ajudam a reduzir os níveis de triglicerídeos no sangue e a pressão arterial, além de prevenir o acúmulo de placas nas artérias. A suplementação regular de Ômega 3 está associada à redução do risco de doenças cardiovasculares e melhoria da circulação sanguínea. Nossa fórmula concentrada e livre de metais pesados garante eficácia e segurança."
            },
            energia: {
                title: "Mais Energia Diária",
                description: "A combinação dos três suplementos neste combo trabalha sinergicamente para aumentar seus níveis de energia durante o dia. A Vitamina C melhora a absorção de ferro, contribuindo para reduzir a fadiga. O Colágeno auxilia na recuperação muscular após exercícios físicos. O Ômega 3 otimiza o metabolismo energético celular e a função cognitiva, ajudando você a manter o foco e disposição ao longo do dia. Nossos clientes relatam melhora significativa nos níveis de energia após 2 semanas de uso contínuo."
            }
        };
        
        // Modal functionality
        const modal = document.getElementById("benefitModal");
        const modalTitle = document.getElementById("modalTitle");
        const modalDescription = document.getElementById("modalDescription");
        const closeModal = document.querySelector(".close-modal");
        const benefitItems = document.querySelectorAll(".benefit-item");
        
        benefitItems.forEach(item => {
            item.addEventListener("click", function() {
                const benefitType = this.getAttribute("data-benefit");
                const benefitInfo = benefitDetails[benefitType];
                
                modalTitle.textContent = benefitInfo.title;
                modalDescription.textContent = benefitInfo.description;
                modal.style.display = "flex";
            });
        });
        
        closeModal.addEventListener("click", function() {
            modal.style.display = "none";
        });
        
        window.addEventListener("click", function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });