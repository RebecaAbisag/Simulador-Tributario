# CodeConta: Simulador Tributário CLT vs PJ

Este projeto é um simulador tributário interativo desenvolvido para ajudar desenvolvedores a comparar a remuneração líquida entre os regimes CLT (Consolidação das Leis do Trabalho) e Pessoa Jurídica (Simples Nacional - Anexos III e V) no Brasil. A ferramenta permite inserir dados de remuneração e pró-labore, além de selecionar a alíquota de ISS do município, para obter uma estimativa clara das diferenças tributárias.

## Funcionalidades Principais

-   **Simulador CLT vs PJ:** Compare os valores líquidos nos regimes CLT, Simples Nacional (Anexo III e V) e Lucro Presumido.
-   **Cálculo Detalhado:** Apresenta os valores de INSS, IRPF e DAS (para PJ) para cada regime.
-   **Melhor Opção:** Destaca automaticamente a opção mais vantajosa financeiramente.
-   **Assistente IA (Offline):** Um chat flutuante com respostas pré-definidas para tirar dúvidas sobre tributação e regimes.
-   **Alternador de Tema:** Permite alternar entre temas escuro, claro e limpo para uma experiência visual personalizada.
-   **Design Responsivo:** Layout adaptável para diferentes tamanhos de tela (desktop e mobile).
-   **Seções "Sou Contador" e "Indicações":** Atualmente funcionam como placeholders para futuras implementações de registro e exibição de contadores, sem persistência de dados.


## Estrutura do Projeto

O projeto é organizado da seguinte forma:

-   `index.html`: O arquivo HTML principal que define a estrutura da página.
-   `src/css/`: Contém os arquivos CSS para estilização, organizados modularmente:
    -   `style.css`: O arquivo principal que importa todos os outros módulos CSS.
    -   `base/`: Estilos fundamentais.
        -   `_variables.css`: Definição de variáveis CSS (cores, fontes, etc.) e temas.
        -   `_global.css`: Estilos globais para `body`, inputs genéricos e foco.
        -   `_icons.css`: Estilos para ícones e animações de rotação.
    -   `components/`: Estilos para componentes reutilizáveis.
        -   `_buttons.css`: Estilos para botões.
        -   `_cards.css`: Estilos para cards genéricos.
        -   `_chat.css`: Estilos para a interface do chat.
        -   `_floating-elements.css`: Estilos para elementos flutuantes (ex: botão e janela do chat).
        -   `_accountant-cards.css`: Estilos para os cards de contadores.
    -   `layout/`: Estilos para a estrutura e layout da página.
        -   `_nav.css`: Estilos para a barra de navegação.
        -   `_header.css`: Estilos para o cabeçalho.
        -   `_main.css`: Estilos para o conteúdo principal e formulários.
        -   `_results.css`: Estilos para a seção de resultados do simulador.
        -   `_sections.css`: Estilos para seções gerais da página.
    -   `utilities/`: Classes utilitárias.
        -   `_hidden.css`: Classe para ocultar elementos.
-   `src/js/`: Contém os arquivos JavaScript para a lógica da aplicação.
    -   `main.js`: Lógica principal da UI, alternador de tema, menu mobile e inicialização.
    -   `simulator.js`: Funções de cálculo para o simulador tributário.
    -   `ui.js`: Funções auxiliares para manipulação da interface do usuário (exibição de mensagens, fontes).
    -   `chat.js`: Implementação do assistente de chat (atualmente com respostas offline pré-definidas).
    -   `constants.js`: Constantes e tabelas de alíquotas (IR, INSS, Simples Nacional).
    -   `helpers.js`: Funções utilitárias diversas (formatação de moeda, fetch com retentativa).

## Como Usar

1.  **Abra o Projeto:** Basta abrir o arquivo `index.html` em seu navegador web preferido.
2.  **Insira os Dados:** Preencha o "Salário Bruto Mensal / Faturamento PJ" e o "Pró-labore Mínimo Desejado".
3.  **Selecione o Município:** Escolha a alíquota de ISS do seu município.
4.  **Calcule:** Clique no botão "Calcular Comparativo" para ver os resultados.
5.  **Limpar Dados:** Use o botão "Limpar Dados" para resetar o formulário.

### Alternador de Tema

Na barra de navegação, clique no ícone de raio para alternar entre os temas escuro, claro e limpo.

### Assistente IA Flutuante

O Assistente IA está disponível como um botão flutuante no canto inferior direito da tela. Clique no ícone de robô para abrir ou fechar o chat e fazer perguntas sobre tributação.

## Análise e Melhorias Realizadas

Com base nas interações e solicitações, as seguintes melhorias foram implementadas:

-   **Refatoração do CSS:** O CSS foi completamente refatorado e organizado em uma estrutura modular (base, components, layout, utilities), promovendo maior controle, reusabilidade e entendimento dos estilos.
-   **Organização do Layout:** Os campos de entrada do formulário foram ajustados para melhor espaçamento e alinhamento, garantindo uma interface mais limpa e intuitiva.
-   **Centralização de Títulos:** Todos os títulos principais da página foram centralizados para melhorar a estética e a legibilidade.
-   **Funcionalidade do Botão "Limpar Dados":** Corrigido o comportamento do botão de reset para que ele não apenas limpe os campos do formulário, mas também zere e oculte a seção de resultados da simulação.
-   **Implementação de Tema "Clean":** Adicionado um terceiro tema ("clean") ao alternador de temas, oferecendo uma opção de visual mais minimalista com fundo branco e texto preto.
-   **Chat Flutuante do Assistente IA:** A seção do Assistente IA foi convertida em um componente flutuante, acessível por um botão dedicado, liberando espaço na barra de navegação e melhorando a experiência do usuário. O ícone do botão foi alterado para um robô para maior clareza.
-   **Vídeo na Seção "Sobre Nós":** Adicionado um bloco para incorporar um vídeo na seção "Sobre Nós", com um placeholder para o usuário inserir o vídeo desejado.
-   **Atualização do Subtítulo da Simulação:** O subtítulo da simulação foi atualizado para incluir o regime de Lucro Presumido, refletindo a abrangência do simulador.
-   **Simplificação das Seções de Contador:** As seções "Sou Contador" e "Indicações" foram simplificadas para funcionar como placeholders de UI, sem a implementação de um sistema de registro/login em memória ou persistência de dados, focando na experiência do frontend.
-   **Comentários Detalhados:** Adicionados comentários extensivos em português em todos os arquivos HTML, CSS e JavaScript para facilitar a compreensão do código e a manutenção futura.

---

**Nota:** Este simulador é apenas para fins informativos e utiliza dados aproximados. Sempre consulte um contador profissional para cálculos exatos e planejamento tributário adequado.
