package br.com.gabrielfelix.ivoneide_pintura_api.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class OrderItemRequest {

	@NotNull(message = "O id do produto e obrigatorio.")
	private Long produtoId;

	@NotNull(message = "A quantidade e obrigatoria.")
	@Min(value = 1, message = "A quantidade deve ser pelo menos 1.")
	private Integer quantidade;

	public Long getProdutoId() {
		return produtoId;
	}

	public void setProdutoId(Long produtoId) {
		this.produtoId = produtoId;
	}

	public Integer getQuantidade() {
		return quantidade;
	}

	public void setQuantidade(Integer quantidade) {
		this.quantidade = quantidade;
	}
}
