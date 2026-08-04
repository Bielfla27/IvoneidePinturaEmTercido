package br.com.gabrielfelix.ivoneide_pintura_api.order.dto;

import br.com.gabrielfelix.ivoneide_pintura_api.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public class OrderStatusUpdateRequest {

	@NotNull(message = "O status do pedido e obrigatorio.")
	private OrderStatus status;

	public OrderStatus getStatus() {
		return status;
	}

	public void setStatus(OrderStatus status) {
		this.status = status;
	}
}
