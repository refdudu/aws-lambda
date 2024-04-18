# Tutorial para Criar uma Nova Função Lambda com Serverless

## Passo 1 - Instalar o Serverless Framework

Para começar, instale o Serverless Framework no seu sistema operacional executando o seguinte comando no terminal:

```bash
npm install -g serverless
```

## Passo 2 - Configurar Credenciais

Agora, configure as credenciais de acesso ao seu provedor de serviços na nuvem. Por exemplo, para configurar credenciais para AWS, utilize o seguinte comando substituindo `key` e `secretKey` pelos valores das suas credenciais:

```bash
serverless config credentials --provider aws --key key --secret secretKey
```

## Passo 3 - Adicionar uma Nova Função

Para adicionar uma nova função Lambda, siga estas etapas:

1. Navegue até o arquivo `serverless.yml`.
2. Dentro do arquivo, adicione o nome da função sob a seção `functions`, e dentro da definição da função, inclua a propriedade `handler` com o caminho até o arquivo/função. Por exemplo:

```yaml
functions:
  minhaFuncao:
    handler: src/nome_do_arquivo.nome_da_funcao
```

Certifique-se de que o nome da função (`minhaFuncao` neste exemplo) seja único dentro do arquivo `serverless.yml`.


# Problemas com Node 14

Para subir uma função lambda com Node 14, é necessário:
1. Subir a função com Node 20
2. Atualizar função para Node 14