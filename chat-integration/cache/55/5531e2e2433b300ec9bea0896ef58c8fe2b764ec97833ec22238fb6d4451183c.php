<?php

/* login.html */
class __TwigTemplate_e9ff862391c6039839cfd3f16454c0e7975a483049c47d63efca31ae1ef7e31b extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        echo "<!DOCTYPE html>
<html>
  <head>
    <meta charset=\"utf-8\">
    <title>Qiscus Chat</title>
    <link rel=stylesheet href=\"https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css\">
    <link rel=\"stylesheet\" href=\"https://qiscus-sdk.s3-ap-southeast-1.amazonaws.com/web/v2.5.9/qiscus-sdk.2.5.9.css\">
    <link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css?family=Open+Sans\">
    <link rel=\"stylesheet\" href=\"assets/css/login.css\">
  </head>
  <body>
    <div class=\"wrapper\">
      <h1 class=\"title\">
        Qiscus Chat
      </h1>
      <img class=\"banner\" src=\"assets/img/icon-logo-banner.svg\" alt=\"Banner\">
    </div>
    <script>
      var SDK_APP_ID = '";
        // line 19
        echo twig_escape_filter($this->env, (isset($context["CHAT_APP_ID"]) ? $context["CHAT_APP_ID"] : null), "html", null, true);
        echo "';
    </script>
    <script src=\"https://unpkg.com/lodash@4.17.4/lodash.min.js\"></script>
    <script src=\"https://unpkg.com/jquery@3.2.1/dist/jquery.js\"></script>
    <script src=\"https://qiscus-sdk.s3-ap-southeast-1.amazonaws.com/web/v2.5.9/qiscus-sdk.2.5.9.js\"></script>
    <script src=\"assets/js/md5.min.js\"></script>
    <script src=\"assets/js/login.js\"></script>
  </body>
</html>
";
    }

    public function getTemplateName()
    {
        return "login.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  39 => 19,  19 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Twig_Source("", "login.html", "/home/fitra/Works/Qiscus/RTC/qiscus-rtc-sdk-web/chat-integration/templates/login.html");
    }
}
