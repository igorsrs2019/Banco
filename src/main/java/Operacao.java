import java.util.Scanner;

public class Operacao {

    public static void main(String[] args) {

        Scanner terminal = new Scanner(System.in);


        System.out.println("Bem vindo ao Banco do POVO");
        System.out.println("Digite o valor inicial para criar a sua conta: ");
        long saldoInicial = terminal.nextLong();

        ContaBancaria conta = new ContaBancaria(saldoInicial);

        System.out.println("Conta criada com sucesso");
        System.out.println("Seu saldo é: " + conta.getSaldo() + " e Seu cheque especial é : " + conta.getChequeEspecial() + " e seu limite é " + conta.getLimite());
        int option;

        do {

            System.out.println("1 - Depositar dinheiro");
            System.out.println("2 - Consultar Saldo");
            System.out.println("3 - Sacar dinheiro");
            System.out.println("4 - Consultar Cheque Especial");
            System.out.println("5 - Pagar boletos bancarios");
            System.out.println("6 - Verificar se a conta esta utilizando o Cheque Especial");
            option = terminal.nextInt();


            switch (option) {
                case 1 -> {
                    System.out.println("Digite o valor para depositar: ");
                    long valor = terminal.nextLong();
                    depositoBancario(conta, valor);
                }
                case 2 -> consulta(conta);
                case 3 ->{
                    System.out.println("Digite o valor que voce deseja sacar: ");
                    long valor = terminal.nextLong();
                    sacaValor(conta, valor);
                }
                case 4 -> consultaChequeEspecial(conta);
                case 5 -> {
                    System.out.println("Digite o valor do boleto bancario ");
                    long valor = terminal.nextLong();
                    pagarBoleto(conta, valor);
                }
                case 6 -> verificarUsoChequeEspecial(conta);



            }


        } while (option != 0);
        terminal.close();


    }


    private static void depositoBancario(ContaBancaria conta, long valor ) {



            if (conta.getSaldo() < 0) {
            conta.setSaldo((long) (conta.getSaldo() - Math.abs(conta.getSaldo()) * 0.2));
            System.out.println("Deposito realizado com suceso! novo saldo: " + conta.getSaldo() + " foi debitado 20% do Cheque Especial utilizado");
        }

        else {
            conta.setSaldo(conta.getSaldo() + valor);
            System.out.println("Deposito realizado com suceso! novo saldo: " + conta.getSaldo());
        }


    }
    private static void consulta (ContaBancaria conta) {
         System.out.println("Seu saldo atualmente é : " + conta.getSaldo());

    }

    private static void sacaValor (ContaBancaria conta, long valor) {

       conta.setSaldo(conta.getSaldo() - valor);
       if (valor > conta.getSaldo()) {
           conta.setChequeEspecialAtivo(true);
       }
       System.out.println("Seu novo saldo é: " + conta.getSaldo());
    }

    private static void consultaChequeEspecial (ContaBancaria conta){
        System.out.println("O seu cheque especial esta no valor de: " + conta.getChequeEspecial());
    }


    private static void pagarBoleto (ContaBancaria conta, long valor){
        if (valor > conta.getSaldo()) {
            conta.setChequeEspecialAtivo(true);
        }
        conta.setSaldo(conta.getSaldo() - valor);
        System.out.println("Após o pagamento do boleto bancario o neu novo saldo é: " + conta.getSaldo());
    }

    private static void verificarUsoChequeEspecial (ContaBancaria conta){
        if (conta.getchequeEspecialAtivo()){
            System.out.println("A conta esta utilizando Cheque Especial");
         } else
            System.out.println("A conta não esta utilizando o Cheque Especial");
    }



}









