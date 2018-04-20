cls
call tsc
rem ts-node nbake.ts -i ../exApp1/linkBlog
rem ts-node nbake.ts ../exApp1/page
ts-node nbake.ts ../exApp1/linkBlog

rem ts-node api.ts