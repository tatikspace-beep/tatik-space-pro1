# Istruzioni per gli agenti Tatik.space

- Comunicare con l'utente in italiano.
- Per verificare l'Editor e le sue funzionalita interattive, usare la Preview Vercel secondaria indicata dall'utente. Non sostituire questo test con localhost.
- Il dominio canonico pubblico e `https://tatik.space`. Un URL Vercel di Preview e un ambiente secondario, non il link principale; non confondere i due ambienti.
- Prima di un rilascio, identificare il progetto Vercel corretto (`tatik-space-pro1`), il team scope `tatikspace-beeps-projects` e verificare il dominio di destinazione. Non pubblicare sul progetto secondario o su un progetto omonimo/duplicato per errore.
- Il deploy Production avviene tramite l'integrazione Git di Vercel dal branch `main`. Non aggiungere un deploy Production duplicato in GitHub Actions né richiedere token Vercel ai collaboratori GitHub.
- Rilasciare solo modifiche pertinenti, verificate e richieste. Esaminare prima lo stato Git e non usare `git add -A` in un workspace con modifiche preesistenti.
- Non includere nel repository o nei deployment segreti, file locali di credenziali, file temporanei o bundle generati non necessari. Non stampare o condividere i valori di file potenzialmente sensibili.
- Prima di applicare migrazioni, verificare il database e l'ordine previsto dalla documentazione. Non modificare il database Production senza un'autorizzazione esplicita e specifica.
- Dopo ogni modifica sostanziale alle regole operative o al flusso di rilascio, aggiornare questo file e la documentazione di deploy direttamente interessata.
