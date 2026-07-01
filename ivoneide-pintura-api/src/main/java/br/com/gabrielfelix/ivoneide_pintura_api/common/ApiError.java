package br.com.gabrielfelix.ivoneide_pintura_api.common;

import java.time.LocalDateTime;
import java.util.List;

public class ApiError {

	private LocalDateTime dataHora;
	private int status;
	private String mensagem;
	private List<String> erros;

	public ApiError(int status, String mensagem, List<String> erros) {
		this.dataHora = LocalDateTime.now();
		this.status = status;
		this.mensagem = mensagem;
		this.erros = erros;
	}

	public LocalDateTime getDataHora() {
		return dataHora;
	}

	public int getStatus() {
		return status;
	}

	public String getMensagem() {
		return mensagem;
	}

	public List<String> getErros() {
		return erros;
	}
}
