# Hifpb-scraper

## Sobre
Um crawler/scraper que extrai os dados do portal de horários do IFPB ([HIFPB](https://joaopessoa.ifpb.edu.br/horario)).

## Documentação

### Requisitos

+ [Node 18+](https://nodejs.org/en/).
+ [Yarn](https://classic.yarnpkg.com/en/docs/install).

É possível usar outro gerenciador de pacotes substituindo o Yarn, como o NPM, mas pode haver conflitos devido ao .lock presente no repositório ter sido criado pelo Yarn, para evitar tais conflitos ao usar o NPM apague da pasta o arquivo yarn.lock e deixe apenas o package-lock criado apartir do NPM.
Caso use linux também é possível instalar o Node e Yarn a partir do [NVM](https://github.com/nvm-sh/nvm#installing-and-updating).

### Instalação

+ Instale o [Node 18+](https://nodejs.org/en/) e [Yarn](https://classic.yarnpkg.com/en/docs/install).
+ Clone este repositório.
+ Navegue até a raiz do projeto através de um terminal.
+ Execute no terminal o comando "yarn" sem as aspas.

### Como usar

Ao usar o programa pela primeira vez, execute respectivamente, no terminal, os comandos **"yarn build"** e **"yarn start"** (sem as aspas). Caso já tenha gerado uma build com o **"yarn build"**, execute apenas o **"yarn start"** ou alternativamente dê um duplo clique no arquivo **"hifpb-scraper.ps1"**.

**Há 3 opções na primeira seção**:

+ **Ler dados**: Apresenta um submenu onde é possível escolher um determinado dado que deseja visualizar. Certifique-se de primeiro executar a extração dos dados que deseja ler.
+ **Extrair dados**: Após ter escolhido o dado a ser coletado no submenu, o programa utiliza a técnica de web scraping pra raspar o determinado dado no [HIFPB](https://joaopessoa.ifpb.edu.br/horario)
+ **Sair**: Encerra o programa.

### Ambiente de Desenvolvimento

+ Para iniciar um nodo de desenvolvimento (**ts-node**), navegue até a pasta do projeto e execute no terminal o comando **"yarn dev"**.
+ O projeto foi construído usando o **eslinter** pra forçar um padrão de escrita e boas práticas, caso queira corrigir todos os problemas de sintaxe de uma só vez execute no terminal, o comando **"yarn lint"**.
+ O plugin **Prettier** tambem foi adicionado ao ambiente de desenvolvimento, dessa forma ele e o eslinter se completam, forçando a adoção de boas práticas na sintaxe e uma padronização na formatação. Pra que ambos funcionem instale suas respectivas extensões no **VScode** ou outro editor de código com suporte às mesmas.