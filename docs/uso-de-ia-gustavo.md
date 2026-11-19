Arquivo expondo o uso de IA generativa - Gustavo:

Implementação do relatório de encomendas (UC6):
Usei a IA para me ajudar a desenvolver o relatório e, principalmente, para entender como as partes se conectam: como o TypeScript,
o NestJS e o TypeORM trabalham juntos para buscar os pedidos no banco, como os dados passam pelo controller, pelo service e pelo DAO até chegar na tela em React,
e onde eu precisava mexer para modificar ou ampliar o relatório.

Tela do relatório no painel administrativo:
Pedi ajuda para montar a página AdminReportPage, o hook useOrderReport e o CSS, reaproveitando o padrão de hooks e de estilos das outras páginas do admin,
e para escrever os testes da tela. A IA fez a estrutura inicial e eu validei o comportamento no navegador.

Configuração do ambiente e resolução de erros:
Tive problemas com a versão do Node (os testes do frontend falhavam por causa do localStorage na versão 26), com o Docker Desktop fechado e com o arquivo .env e as migrações do banco.
A IA me guiou passo a passo para resolver (fnm para usar o Node 24, db:up, db:migrate e as variáveis de SMTP).

Auxílio no uso do Git e documentação:
Como não tenho muita prática com o fluxo de branch, commit e Pull Request, pedi orientação para seguir o padrão do grupo.
