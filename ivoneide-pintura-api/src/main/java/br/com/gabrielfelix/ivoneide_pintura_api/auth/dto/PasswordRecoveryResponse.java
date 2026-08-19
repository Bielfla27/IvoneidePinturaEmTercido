package br.com.gabrielfelix.ivoneide_pintura_api.auth.dto;

public class PasswordRecoveryResponse {

	private String mensagem;
	private String codigoTeste;

	public PasswordRecoveryResponse(String mensagem, String codigoTeste) {
		this.mensagem = mensagem;
		this.codigoTeste = codigoTeste;
	}

	public String getMensagem() {
		return mensagem;
	}

	public String getCodigoTeste() {
		return codigoTeste;
	}
}
