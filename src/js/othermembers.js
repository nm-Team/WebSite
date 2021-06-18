membersJSONOrigin=loadc("/src/json/othermembers.json");
membersJSON=JSON.parse(membersJSONOrigin).allmembers;
for(memberId=0;memberId<membersJSON.length;memberId++){
    otherMembers.innerHTML+=`
    <a class="otherMember card-seemore" href="//github.com/`+membersJSON[memberId].githubname+`" target="_blank">
    <p class="name">`+membersJSON[memberId].name+`</p>
    <i  style="background-image: url(https://avatars.githubusercontent.com/u/`+membersJSON[memberId].githubid+`?s=64&v=4);"></i>
</a>
`;
}