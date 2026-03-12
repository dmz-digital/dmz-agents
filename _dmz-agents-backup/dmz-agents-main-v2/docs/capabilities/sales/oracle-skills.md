SKILL_01 :: Calculo de pipeline ponderado por estagio
  Aplica a probabilidade de fechamento por estagio ao valor de cada deal
  e soma o resultado para gerar o pipeline ponderado total. Base do
  forecast e o numero mais objetivo disponivel no pipeline.

SKILL_02 :: Construcao dos tres cenarios de forecast
  Produz conservador, base e otimista com premissas explicitas para cada
  um. O cenario base e o mais provavel; o conservador e para planejamento
  financeiro; o otimista e para capacidade e upside.

SKILL_03 :: Calculo e sinalizacao do gap de meta
  Compara o forecast base com a meta do periodo e calcula o gap em reais
  e percentual. O gap sempre vem acompanhado de como fecha-lo: aceleracao
  de deal existente ou novo business necessario.

SKILL_04 :: Classificacao de risco de meta por nivel
  Classifica o risco em Baixo, Medio, Alto ou Critico com base no
  percentual do forecast base sobre a meta. Cada nivel tem uma acao
  recomendada e um agente a acionar.

SKILL_05 :: Calculo de forecast accuracy historica
  Compara o forecast base de cada periodo com o realizado. Identifica
  se o squad e sistematicamente otimista ou pessimista e ajusta as
  probabilidades por estagio conforme o desvio historico.

SKILL_06 :: Ajuste de probabilidades por estagio com historico real
  Recalibra as probabilidades padrao com base no win rate real do squad
  por estagio. Probabilidades genericas de mercado sao pior do que
  probabilidades calibradas com o historico especifico do time.

SKILL_07 :: Identificacao de deals a excluir do forecast
  Sinaliza deals com sinais de perda iminente que devem sair do forecast
  base para nao inflar o numero. Deal perdido que permanece no forecast
  e a principal causa de forecast accuracy ruim.

SKILL_08 :: Producao do forecast semanal no formato padrao
  Entrega o relatorio com os tres cenarios, o gap, o risco, como fechar
  o gap, as premissas e o historico de accuracy. Numero e risco no topo,
  detalhe abaixo.

SKILL_09 :: Projecao de receita anual com base em tendencia
  Extrapola a tendencia atual de crescimento para projetar o ARR e o MRR
  dos proximos 12 meses. Entrega o cenario com e sem acoes de aceleracao
  para que o CRA entenda o impacto das decisoes de hoje no resultado futuro.

SKILL_10 :: Integracao com o pipeline ponderado do Funnel Analyst
  Consome o pipeline ponderado entregue pelo Funnel Analyst como input
  principal do forecast. Quando os dois agentes operam em sinconia, o
  forecast e atualizado automaticamente a cada movimentacao relevante.
