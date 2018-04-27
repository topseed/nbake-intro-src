cls
call tsc
call ts-node nbake.ts -i ../exApp1/blog
rem ts-node nbake.ts ../exApp1/page
ts-node nbake.ts ../exApp1/blog
