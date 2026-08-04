package br.com.gabrielfelix.ivoneide_pintura_api.order.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

public class OrderCreateRequest {

	@NotEmpty(message = "O pedido deve ter pelo menos um item.")
	@Valid
	private List<OrderItemRequest> itens;

	public List<OrderItemRequest> getItens() {
		return itens;
	}

	public void setItens(List<OrderItemRequest> itens) {
		this.itens = itens;
	}
}
