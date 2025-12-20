export function TermsPT() {
    return (
        <div className="space-y-6">
            <h1>Termos de Serviço</h1>
            <p className="text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-PT")}</p>

            <section>
                <h2>1. Aceitação dos Termos</h2>
                <p>
                    Estes Termos de Serviço constituem um acordo legalmente vinculativo entre si, seja pessoalmente ou em nome de uma entidade ("você") e a Framax Solutions ("nós", "nos" ou "nosso"), referente ao seu acesso e utilização do nosso website e serviços.
                </p>
            </section>

            <section>
                <h2>2. Direitos de Propriedade Intelectual</h2>
                <p>
                    Salvo indicação em contrário, o Site é nossa propriedade exclusiva e todo o código-fonte, bancos de dados, funcionalidade, software, designs de website, áudio, vídeo, texto, fotografias e gráficos no Site são de nossa propriedade ou controlados por nós ou licenciados para nós.
                </p>
            </section>

            <section>
                <h2>3. Lei Aplicável</h2>
                <p>
                    Estes Termos serão regidos e definidos de acordo com as leis de Portugal. A Framax Solutions e você consentem irrevogavelmente que os tribunais de Portugal terão jurisdição exclusiva para resolver qualquer litígio que possa surgir em conexão com estes termos.
                </p>
            </section>

            <section>
                <h2>4. Contacte-nos</h2>
                <p>
                    Para resolver uma reclamação referente ao Site ou para receber mais informações sobre a utilização do Site, por favor contacte-nos através de contact@framaxsolutions.com.
                </p>
            </section>
        </div>
    );
}
