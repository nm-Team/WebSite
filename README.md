# nmTeam Official HomePage
You can visit the site at [https://nmteam.xyz](https://nmteam.xyz?ref=nmTeam_GitHub_HomePage).

![Website Screenshot][screenshot]

[screenshot]: https://websiteres.nmteam.xyz/github/nmTeam_Website_ScreenShot.png

## Rewrite rules
```nginx
location /products/overview/ {
    rewrite ^/products/overview/(.*)$ /products/overview.php?product=$1 last;
}
location /blackboard/questionnaire {
    rewrite ^/blackboard/questionnaire/(.*)$ /blackboard/questionnaire/index.php?id=$1 last;
}
location / {
    try_files $uri $uri/ $uri.php?$args;
}
```
