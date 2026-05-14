# nmTeam Official HomePage
You can visit the site at [https://nmteam.xyz](https://nmteam.xyz?ref=nmTeam_GitHub_HomePage).

![Website Screenshot][screenshot]

[screenshot]: https://websiteres.nmteam.xyz/github/nmTeam_Website_ScreenShot.png

## Rewrite rules
```nginx
location ~ ^/products/overview/(?<product>[^/]+)$ {
    rewrite ^ /products/overview.php?product=$product last;
}
location ~ ^/blackboard/questionnaire/(?<id>[^/]+)$ {
    rewrite ^ /blackboard/questionnaire/index.php?id=$id last;
}
location / {
    try_files $uri $uri/ $uri.php?$args;
}
```
