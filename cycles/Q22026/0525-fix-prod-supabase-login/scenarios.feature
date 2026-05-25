Feature: Login em produção via Supabase Auth

  Background:
    Given o ambiente de produção está configurado com env vars Supabase válidas na Vercel
    And a migration de profiles está aplicada no banco Supabase

  Scenario: Admin acessa o painel após login bem-sucedido
    Given existe um usuário com role "admin" em public.profiles
    When o usuário entra com e-mail e senha corretos em /login
    Then é redirecionado para /admin sem loop de redirect
    And a página /admin carrega com status 200
    And a sessão persiste após refresh da página

  Scenario: Cliente acessa o dashboard após login bem-sucedido
    Given existe um usuário com role "customer" em public.profiles
    When o usuário entra com e-mail e senha corretos em /login
    Then é redirecionado para /dashboard sem loop de redirect
    And a sessão persiste após refresh da página

  Scenario: Credenciais inválidas mantêm o usuário em /login
    When o usuário tenta entrar com e-mail ou senha incorretos
    Then permanece em /login
    And uma mensagem de erro é exibida na tela
    And não ocorre redirecionamento para /admin ou /dashboard

  Scenario: Usuário Auth sem perfil recebe perfil criado automaticamente no primeiro login
    Given existe um usuário em auth.users sem linha correspondente em public.profiles
    When o usuário entra com credenciais corretas
    Then um perfil é criado automaticamente com role "customer"
    And o usuário é redirecionado para /dashboard sem loop

  Scenario: Falha de persistência de sessão exibe erro explícito na UI
    Given o Supabase Auth retornou tokens válidos para o browser
    When /auth/session não consegue gravar cookies no servidor
    Then uma mensagem de erro clara é exibida em /login
    And não ocorre loop silencioso de redirect para /login

  Scenario: Acesso direto a rotas protegidas sem sessão redireciona para login
    Given um usuário não autenticado
    When acessa /admin ou /dashboard diretamente pela URL
    Then é redirecionado para /login
    And após fazer login com credenciais válidas, é encaminhado ao destino correto

  Scenario Outline: Redirecionamento pós-login por papel
    Given existe um usuário autenticado com role "<role>"
    When realiza login com credenciais corretas
    Then é redirecionado para "<destino>"

    Examples:
      | role     | destino    |
      | admin    | /admin     |
      | customer | /dashboard |
