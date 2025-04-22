public class ContaBancaria {
    private long saldo;
    private long chequeEspecial;
    private long limite;
    private boolean chequeEspecialAtivo;



  public ContaBancaria (long saldoInicial) {
      this.saldo = saldoInicial;


      if (saldoInicial <=500 ){
          this.chequeEspecial = 50;
      }else {
          this.chequeEspecial =   saldoInicial / 2;
      }
      this.limite = saldoInicial + chequeEspecial;
  }

public long getSaldo (){
    return  saldo;
}

public void setSaldo (long saldo){
    this.saldo = saldo;
}

public long getChequeEspecial (){
    return chequeEspecial;
}

public void setChequeEspecial (long chequeEspecial){
    this.chequeEspecial = chequeEspecial;
}

public long getLimite (){
      return limite;
}
public void setLimite (long limite ){
      this.limite = limite;
}

public void setChequeEspecialAtivo (boolean chequeEspecialAtivo){
      this.chequeEspecialAtivo = chequeEspecialAtivo;
}

public boolean getchequeEspecialAtivo (){
      return chequeEspecialAtivo;
}


}
