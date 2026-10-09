# Istruzioni per gli agenti Tatik.space

- Comunicare con l'utente in italiano.
- Per verificare l'Editor e le sue funzionalita interattive, usare la Preview Vercel secondaria indicata dall'utente. Non sostituire questo test con localhost.
- Il dominio principale/canonico pubblico e `https://www.tatik.space/editor` (`www.tatik.space`). `https://tatik.space` e secondario; gli URL Vercel di Preview sono ambienti di test distinti. Non confondere Production, dominio secondario e Preview.
- Prima di un rilascio, identificare il progetto Vercel corretto (`tatik-space-pro1`), il team scope `tatikspace-beeps-projects` e verificare il dominio di destinazione. Non pubblicare sul progetto secondario o su un progetto omonimo/duplicato per errore.
- Il deploy Production avviene tramite l'integrazione Git di Vercel dal branch `main`. Non aggiungere un deploy Production duplicato in GitHub Actions né richiedere token Vercel ai collaboratori GitHub.
- Un deploy Preview riuscito non autorizza da solo la pubblicazione su Production: verificare con l'utente prima di portare modifiche su `main` e specificare chiaramente che il deploy raggiungera il sito principale `https://www.tatik.space`.
- Rilasciare solo modifiche pertinenti, verificate e richieste. Esaminare prima lo stato Git e non usare `git add -A` in un workspace con modifiche preesistenti.
- Non includere nel repository o nei deployment segreti, file locali di credenziali, file temporanei o bundle generati non necessari. Non stampare o condividere i valori di file potenzialmente sensibili.
- Prima di applicare migrazioni, verificare il database e l'ordine previsto dalla documentazione. Non modificare il database Production senza un'autorizzazione esplicita e specifica.
- Dopo ogni modifica sostanziale alle regole operative o al flusso di rilascio, aggiornare questo file e la documentazione di deploy direttamente interessata.
